import http from "http";
import app from "./app";
import { config } from "./config";
import { connectPostgres } from "./db/postgres";
import { connectMongo } from "./db/mongo";
import { createWsServer } from "./realtime/ws-server";
import { startMqttBridge, stopMqttBridge } from "./realtime/mqtt-bridge";
import { createLogger } from "./lib/logger";
import { startPiBackupSync } from "./integrations/pi-backup-sync";

const log = createLogger("server");

async function bootstrap() {
  // Connect to databases (fail fast if unavailable)
  await connectPostgres();
  await connectMongo();

  // Create HTTP server and attach WebSocket server
  const server = http.createServer(app);
  createWsServer(server);

  // Start the MQTT bridge (silently skipped if AWS env vars are missing)
  startMqttBridge();
  const stopPiBackupSync = startPiBackupSync();

  server.listen(config.port, () => {
    log.info(`HTTP server listening on http://localhost:${config.port}`);
    log.info(`WebSocket server at    ws://localhost:${config.port}/ws`);
    log.info(`Health check:          http://localhost:${config.port}/api/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    log.info(`${signal} received, shutting down…`);
    stopMqttBridge();
    stopPiBackupSync();
    server.close(() => {
      log.info("Server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
