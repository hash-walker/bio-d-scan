import fs from "fs/promises";
import path from "path";
import { config } from "../config";
import { createLogger } from "../lib/logger";

const SftpClient = require("ssh2-sftp-client") as new () => {
  connect(config: {
    host: string;
    port?: number;
    username: string;
    password?: string;
    readyTimeout?: number;
  }): Promise<void>;
  list(remotePath: string): Promise<RemoteEntry[]>;
  fastGet(remotePath: string, localPath: string): Promise<void>;
  end(): Promise<void>;
};

const log = createLogger("pi-sync");

type RemoteEntry = {
  name: string;
  type: string;
  size: number;
  modifyTime?: number;
};

type SyncStats = {
  downloaded: number;
  skipped: number;
  directories: number;
};

async function ensureDirectory(target: string): Promise<void> {
  await fs.mkdir(target, { recursive: true });
}

async function shouldDownloadFile(localPath: string, entry: RemoteEntry): Promise<boolean> {
  try {
    const stat = await fs.stat(localPath);
    const remoteMtimeMs = (entry.modifyTime ?? 0) * 1000;
    return stat.size !== entry.size || stat.mtimeMs + 1000 < remoteMtimeMs;
  } catch {
    return true;
  }
}

async function syncRemoteDirectory(
  client: InstanceType<typeof SftpClient>,
  remoteDir: string,
  localDir: string
): Promise<SyncStats> {
  await ensureDirectory(localDir);
  const entries = (await client.list(remoteDir)) as RemoteEntry[];
  const stats: SyncStats = { downloaded: 0, skipped: 0, directories: 0 };

  for (const entry of entries) {
    const remotePath = path.posix.join(remoteDir, entry.name);
    const localPath = path.join(localDir, entry.name);

    if (entry.type === "d") {
      stats.directories += 1;
      const nested = await syncRemoteDirectory(client, remotePath, localPath);
      stats.downloaded += nested.downloaded;
      stats.skipped += nested.skipped;
      stats.directories += nested.directories;
      continue;
    }

    if (entry.type !== "-") {
      continue;
    }

    if (await shouldDownloadFile(localPath, entry)) {
      await ensureDirectory(path.dirname(localPath));
      await client.fastGet(remotePath, localPath);
      stats.downloaded += 1;
    } else {
      stats.skipped += 1;
    }
  }

  return stats;
}

export function startPiBackupSync(): () => void {
  const syncConfig = config.piSync;
  if (!syncConfig.enabled) {
    log.info("Pi backup sync is disabled.");
    return () => {};
  }

  if (!syncConfig.host || !syncConfig.username || !syncConfig.password || !syncConfig.remoteDir) {
    log.warn("Pi backup sync is enabled but credentials or remote directory are missing.");
    return () => {};
  }

  let timer: NodeJS.Timeout | null = null;
  let running = false;
  let stopped = false;

  const runSync = async () => {
    if (running || stopped) return;
    running = true;

    const client = new SftpClient();
    try {
      await ensureDirectory(syncConfig.localDir);
      await client.connect({
        host: syncConfig.host,
        port: syncConfig.port,
        username: syncConfig.username,
        password: syncConfig.password,
        readyTimeout: 20000,
      });

      const started = Date.now();
      const stats = await syncRemoteDirectory(client, syncConfig.remoteDir, syncConfig.localDir);
      log.info(
        `Pi backup sync complete in ${Date.now() - started}ms (${stats.downloaded} downloaded, ${stats.skipped} skipped, ${stats.directories} dirs)`
      );
    } catch (err) {
      log.warn("Pi backup sync failed", err);
    } finally {
      running = false;
      await client.end().catch(() => undefined);
    }
  };

  log.info(
    `Starting Pi backup sync every ${Math.round(syncConfig.intervalMs / 1000)}s from ${syncConfig.username}@${syncConfig.host}:${syncConfig.remoteDir}`
  );

  void runSync();
  timer = setInterval(() => {
    void runSync();
  }, syncConfig.intervalMs);

  return () => {
    stopped = true;
    if (timer) clearInterval(timer);
  };
}
