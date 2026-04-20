"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPiBackupSync = startPiBackupSync;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const logger_1 = require("../lib/logger");
const SftpClient = require("ssh2-sftp-client");
const log = (0, logger_1.createLogger)("pi-sync");
async function ensureDirectory(target) {
    await promises_1.default.mkdir(target, { recursive: true });
}
async function shouldDownloadFile(localPath, entry) {
    try {
        const stat = await promises_1.default.stat(localPath);
        const remoteMtimeMs = (entry.modifyTime ?? 0) * 1000;
        return stat.size !== entry.size || stat.mtimeMs + 1000 < remoteMtimeMs;
    }
    catch {
        return true;
    }
}
async function syncRemoteDirectory(client, remoteDir, localDir) {
    await ensureDirectory(localDir);
    const entries = (await client.list(remoteDir));
    const stats = { downloaded: 0, skipped: 0, directories: 0 };
    for (const entry of entries) {
        const remotePath = path_1.default.posix.join(remoteDir, entry.name);
        const localPath = path_1.default.join(localDir, entry.name);
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
            await ensureDirectory(path_1.default.dirname(localPath));
            await client.fastGet(remotePath, localPath);
            stats.downloaded += 1;
        }
        else {
            stats.skipped += 1;
        }
    }
    return stats;
}
function startPiBackupSync() {
    const syncConfig = config_1.config.piSync;
    if (!syncConfig.enabled) {
        log.info("Pi backup sync is disabled.");
        return () => { };
    }
    if (!syncConfig.host || !syncConfig.username || !syncConfig.password || !syncConfig.remoteDir) {
        log.warn("Pi backup sync is enabled but credentials or remote directory are missing.");
        return () => { };
    }
    let timer = null;
    let running = false;
    let stopped = false;
    const runSync = async () => {
        if (running || stopped)
            return;
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
            log.info(`Pi backup sync complete in ${Date.now() - started}ms (${stats.downloaded} downloaded, ${stats.skipped} skipped, ${stats.directories} dirs)`);
        }
        catch (err) {
            log.warn("Pi backup sync failed", err);
        }
        finally {
            running = false;
            await client.end().catch(() => undefined);
        }
    };
    log.info(`Starting Pi backup sync every ${Math.round(syncConfig.intervalMs / 1000)}s from ${syncConfig.username}@${syncConfig.host}:${syncConfig.remoteDir}`);
    void runSync();
    timer = setInterval(() => {
        void runSync();
    }, syncConfig.intervalMs);
    return () => {
        stopped = true;
        if (timer)
            clearInterval(timer);
    };
}
//# sourceMappingURL=pi-backup-sync.js.map