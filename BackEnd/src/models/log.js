const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  level: { type: Number, required: true }, // bunyan numeric level (50=error, 60=fatal)
  levelName: { type: String, required: true }, // "error" | "fatal"
  msg: { type: String, required: true },
  service: { type: String },
  err: {
    message: String,
    name: String,
    stack: String,
  },
  req: {
    method: String,
    url: String,
    ip: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60, // TTL: auto-delete after 30 days
  },
});

const Log = mongoose.model("Log", logSchema);
module.exports = Log;
