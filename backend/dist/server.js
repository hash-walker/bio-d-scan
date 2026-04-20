"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const postgres_1 = require("./db/postgres");
const mongo_1 = require("./db/mongo");
const ws_server_1 = require("./realtime/ws-server");
const mqtt_bridge_1 = require("./realtime/mqtt-bridge");
const logger_1 = require("./lib/logger");
const log = (0, logger_1.createLogger)("server");
async function bootstrap() {
    // Connect to databases (fail fast if unavailable)
    await (0, postgres_1.connectPostgres)();
    await (0, mongo_1.connectMongo)();
    // Create HTTP server and attach WebSocket server
    const server = http_1.default.createServer(app_1.default);
    (0, ws_server_1.createWsServer)(server);
    // Start the MQTT bridge (silently skipped if AWS env vars are missing)
    (0, mqtt_bridge_1.startMqttBridge)();
    server.listen(config_1.config.port, () => {
        log.info(`HTTP server listening on http://localhost:${config_1.config.port}`);
        log.info(`WebSocket server at    ws://localhost:${config_1.config.port}/ws`);
        log.info(`Health check:          http://localhost:${config_1.config.port}/api/health`);
    });
    // Graceful shutdown
    const shutdown = async (signal) => {
        log.info(`${signal} received, shutting down…`);
        (0, mqtt_bridge_1.stopMqttBridge)();
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
//# sourceMappingURL=server.js.map