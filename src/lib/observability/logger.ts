type LogLevel = "debug" | "info" | "warn" | "error";

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  service?: string;
  requestId?: string;
  userId?: string;
  teamId?: string;
  durationMs?: number;
  error?: string;
  metadata?: Record<string, unknown>;
};

const isDev = process.env.NODE_ENV === "development";

function formatLog(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}]${entry.service ? ` [${entry.service}]` : ""} ${entry.message}`;

  if (isDev) {
    const extras: string[] = [];
    if (entry.durationMs !== undefined) extras.push(`dur=${entry.durationMs}ms`);
    if (entry.userId) extras.push(`user=${entry.userId}`);
    if (entry.teamId) extras.push(`team=${entry.teamId}`);
    if (entry.requestId) extras.push(`req=${entry.requestId}`);
    if (entry.error) extras.push(`error=${entry.error}`);
    const suffix = extras.length > 0 ? ` ${extras.join(" ")}` : "";
    return base + suffix;
  }

  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, meta?: Partial<LogEntry>): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const formatted = formatLog(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "debug":
      if (isDev) console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  info: (message: string, meta?: Partial<LogEntry>) => log("info", message, meta),
  warn: (message: string, meta?: Partial<LogEntry>) => log("warn", message, meta),
  error: (message: string, meta?: Partial<LogEntry>) => log("error", message, meta),
  debug: (message: string, meta?: Partial<LogEntry>) => log("debug", message, meta),

  timed<T>(label: string, fn: () => Promise<T>, meta?: Partial<LogEntry>): Promise<T> {
    const start = Date.now();
    return fn()
      .then((result) => {
        logger.info(`Completed: ${label}`, { ...meta, durationMs: Date.now() - start });
        return result;
      })
      .catch((error) => {
        logger.error(`Failed: ${label}`, {
          ...meta,
          durationMs: Date.now() - start,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      });
  },
};

export type { LogEntry, LogLevel };
