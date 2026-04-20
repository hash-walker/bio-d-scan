"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const error_handler_1 = require("./middleware/error-handler");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const farmer_routes_1 = __importDefault(require("./modules/farmer/farmer.routes"));
const captures_routes_1 = __importDefault(require("./modules/captures/captures.routes"));
const credits_routes_1 = __importDefault(require("./modules/credits/credits.routes"));
const gov_routes_1 = __importDefault(require("./modules/government/gov.routes"));
const ws_server_1 = require("./realtime/ws-server");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// ─── Middleware ───────────────────────────────────────────────────────────────
// Allow comma-separated origins (e.g. http://localhost:3000,http://127.0.0.1:3000)
// so registration works whether the app is opened via localhost or 127.0.0.1.
const corsOrigins = config_1.config.frontendUrl
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: corsOrigins.length <= 1 ? corsOrigins[0] ?? true : corsOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", auth_routes_1.default);
app.use("/api/farmers", farmer_routes_1.default);
app.use("/api/captures", captures_routes_1.default);
app.use("/api/credits", credits_routes_1.default);
app.use("/api/gov", gov_routes_1.default);
// Serve uploads directory statically
app.use("/uploads", express_1.default.static(path_1.default.resolve(process.cwd(), "uploads")));
app.use("/backup-assets", express_1.default.static(process.env.BACKUP_CAPTURES_DIR || path_1.default.resolve(process.cwd(), "data", "pi-backups")));
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        wsClients: (0, ws_server_1.getConnectedCount)(),
        timestamp: new Date().toISOString(),
    });
});
// ─── Error handling ───────────────────────────────────────────────────────────
app.use(error_handler_1.notFound);
app.use(error_handler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map