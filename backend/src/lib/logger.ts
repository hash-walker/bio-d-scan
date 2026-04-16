const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 } as const;
type Level = keyof typeof LEVELS;

const COLORS: Record<Level, string> = {
  error: "\x1b[31m",
  warn: "\x1b[33m",
  info: "\x1b[36m",
  debug: "\x1b[90m",
};
const RESET = "\x1b[0m";

function log(level: Level, module: string, message: string, meta?: unknown) {
  const ts = new Date().toISOString();
  const color = COLORS[level];
  const prefix = `${color}[${level.toUpperCase()}]${RESET} ${ts} [${module}]`;
  if (meta !== undefined) {
    console.log(`${prefix} ${message}`, meta);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

export function createLogger(module: string) {
  return {
    info: (msg: string, meta?: unknown) => log("info", module, msg, meta),
    warn: (msg: string, meta?: unknown) => log("warn", module, msg, meta),
    error: (msg: string, meta?: unknown) => log("error", module, msg, meta),
    debug: (msg: string, meta?: unknown) => log("debug", module, msg, meta),
  };
}
