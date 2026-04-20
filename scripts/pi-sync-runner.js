const fs = require("fs/promises");
const path = require("path");
const SftpClient = require("ssh2-sftp-client");

const env = {
  enabled: process.env.PI_SYNC_ENABLED === "true",
  host: process.env.PI_SYNC_HOST || "",
  port: Number(process.env.PI_SYNC_PORT || "22"),
  username: process.env.PI_SYNC_USERNAME || "",
  password: process.env.PI_SYNC_PASSWORD || "",
  remoteDir: process.env.PI_SYNC_REMOTE_DIR || "",
  localDir: process.env.BACKUP_CAPTURES_DIR || "/app/data/pi-backups",
  intervalMs: Number(process.env.PI_SYNC_INTERVAL_MS || "60000"),
};

function log(level, message, meta) {
  const ts = new Date().toISOString();
  if (meta !== undefined) {
    console.log(`[${level}] ${ts} [pi-sync-runner] ${message}`, meta);
  } else {
    console.log(`[${level}] ${ts} [pi-sync-runner] ${message}`);
  }
}

async function ensureDirectory(target) {
  await fs.mkdir(target, { recursive: true });
}

async function shouldDownload(localPath, entry) {
  try {
    const stat = await fs.stat(localPath);
    const remoteMtimeMs = (entry.modifyTime || 0) * 1000;
    return stat.size !== entry.size || stat.mtimeMs + 1000 < remoteMtimeMs;
  } catch {
    return true;
  }
}

async function syncDirectory(client, remoteDir, localDir) {
  await ensureDirectory(localDir);
  const entries = await client.list(remoteDir);
  const stats = { downloaded: 0, skipped: 0, directories: 0 };

  for (const entry of entries) {
    const remotePath = path.posix.join(remoteDir, entry.name);
    const localPath = path.join(localDir, entry.name);

    if (entry.type === "d") {
      stats.directories += 1;
      const nested = await syncDirectory(client, remotePath, localPath);
      stats.downloaded += nested.downloaded;
      stats.skipped += nested.skipped;
      stats.directories += nested.directories;
      continue;
    }

    if (entry.type !== "-") continue;

    if (await shouldDownload(localPath, entry)) {
      await ensureDirectory(path.dirname(localPath));
      await client.fastGet(remotePath, localPath);
      stats.downloaded += 1;
    } else {
      stats.skipped += 1;
    }
  }

  return stats;
}

async function runSync() {
  const client = new SftpClient();
  try {
    await ensureDirectory(env.localDir);
    await client.connect({
      host: env.host,
      port: env.port,
      username: env.username,
      password: env.password,
      readyTimeout: 20000,
    });

    const started = Date.now();
    const stats = await syncDirectory(client, env.remoteDir, env.localDir);
    log(
      "INFO",
      `Sync complete in ${Date.now() - started}ms (${stats.downloaded} downloaded, ${stats.skipped} skipped, ${stats.directories} dirs)`
    );
  } catch (error) {
    log("WARN", "Sync failed", error);
  } finally {
    try {
      await client.end();
    } catch {
      // ignore disconnect errors
    }
  }
}

async function main() {
  if (!env.enabled) {
    log("INFO", "Pi sync runner disabled.");
    return;
  }

  if (!env.host || !env.username || !env.password || !env.remoteDir) {
    log("WARN", "Pi sync runner missing required connection settings.");
    return;
  }

  log(
    "INFO",
    `Starting sync every ${Math.round(env.intervalMs / 1000)}s from ${env.username}@${env.host}:${env.remoteDir}`
  );

  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    await runSync();
    running = false;
  };

  await tick();
  setInterval(() => {
    void tick();
  }, env.intervalMs);
}

void main();
