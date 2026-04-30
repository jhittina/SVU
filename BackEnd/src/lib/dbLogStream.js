const Log = require("../models/log");

const LEVEL_NAMES = { 50: "error", 60: "fatal" };

class DbLogStream {
  write(record) {
    try {
      const entry = typeof record === "string" ? JSON.parse(record) : record;

      // Only persist error (50) and fatal (60) — ignore info/warn
      if (entry.level < 50) return;

      Log.create({
        level: entry.level,
        levelName: LEVEL_NAMES[entry.level] || String(entry.level),
        msg: entry.msg,
        service: entry.name,
        err: entry.err
          ? {
              message: entry.err.message,
              name: entry.err.name,
              stack: entry.err.stack,
            }
          : undefined,
        req: entry.req
          ? {
              method: entry.req.method,
              url: entry.req.url,
              ip: entry.req.remoteAddress,
            }
          : undefined,
      }).catch(() => {}); // never let a logging failure crash the app
    } catch (_) {}
  }
}

module.exports = DbLogStream;
