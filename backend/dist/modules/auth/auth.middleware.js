"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const error_handler_1 = require("../../middleware/error-handler");
function requireAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return next((0, error_handler_1.createError)("Unauthorized", 401));
    }
    const token = header.slice(7);
    try {
        req.auth = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        next();
    }
    catch {
        next((0, error_handler_1.createError)("Token invalid or expired", 401));
    }
}
function requireRole(role) {
    return (req, _res, next) => {
        if (!req.auth || req.auth.role !== role) {
            return next((0, error_handler_1.createError)("Forbidden", 403));
        }
        next();
    };
}
//# sourceMappingURL=auth.middleware.js.map