"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFound = notFound;
exports.createError = createError;
const zod_1 = require("zod");
const logger_1 = require("../lib/logger");
const log = (0, logger_1.createLogger)("error");
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({ error: "Validation error", details: err.errors });
        return;
    }
    const status = err.statusCode ?? 500;
    const message = err.message || "Internal server error";
    if (status >= 500)
        log.error(message, err);
    res.status(status).json({ error: message });
}
function notFound(_req, res) {
    res.status(404).json({ error: "Not found" });
}
function createError(message, statusCode) {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}
//# sourceMappingURL=error-handler.js.map