"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = createLogger;
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const COLORS = {
    error: "\x1b[31m",
    warn: "\x1b[33m",
    info: "\x1b[36m",
    debug: "\x1b[90m",
};
const RESET = "\x1b[0m";
function log(level, module, message, meta) {
    const ts = new Date().toISOString();
    const color = COLORS[level];
    const prefix = `${color}[${level.toUpperCase()}]${RESET} ${ts} [${module}]`;
    if (meta !== undefined) {
        console.log(`${prefix} ${message}`, meta);
    }
    else {
        console.log(`${prefix} ${message}`);
    }
}
function createLogger(module) {
    return {
        info: (msg, meta) => log("info", module, msg, meta),
        warn: (msg, meta) => log("warn", module, msg, meta),
        error: (msg, meta) => log("error", module, msg, meta),
        debug: (msg, meta) => log("debug", module, msg, meta),
    };
}
//# sourceMappingURL=logger.js.map