const bunyan = require("bunyan");
const DbLogStream = require("./dbLogStream");

function createLogger(serviceName) {
  return bunyan.createLogger({
    name: serviceName,
    level: "info",
    streams: [
      // All info+ logs go to stdout (Render captures these)
      {
        level: "info",
        stream: process.stdout,
      },
      // Only error/fatal logs are persisted to MongoDB with TTL
      {
        level: "error",
        type: "raw",
        stream: new DbLogStream(),
      },
    ],
    serializers: bunyan.stdSerializers,
  });
}

module.exports = createLogger;
