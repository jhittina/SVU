const express = require("express");
const env = require("dotenv");
env.config();

const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");

// ── Validate required env vars at startup ────────────────────────────────────
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET", "ALLOWED_ORIGIN"];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// ── Routes ───────────────────────────────────────────────────────────────────
const superadminRoutes = require("./routes/superadmin/auth");
const adminRoutes = require("./routes/admin/auth");
const production = require("./routes/production");
const customerDetail = require("./routes/customerDetail");
const vehicalDetail = require("./routes/vehicalDetail");
const supplairDetail = require("./routes/supplairDetail");
const dailyTransportDetail = require("./routes/dailyTransportDetail");
const dustAndPowderRawMatirial = require("./routes/dustAndPowderRawMatirial");
const cementRawMatirial = require("./routes/cementRawMatirial");
const pondAshRawMatirial = require("./routes/pondAshRawMatirial");
const flyAshRawMatirial = require("./routes/flyAshRawMatirial");
const chemicalRawMatirial = require("./routes/chemicalRawMatirial");
const workerSalary = require("./routes/workerSalary");
const maintainesCost = require("./routes/maintainesCost");
const sale = require("./routes/sales");
const bill = require("./routes/bill");
const payment = require("./routes/payment");

// ── Database ─────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
mongoose.connection
  .once("open", () => console.log("Database connected"))
  .on("error", (err) => console.error("DB connection error:", err.message));

// ── Security middleware ───────────────────────────────────────────────────────
// Set secure HTTP headers
app.use(helmet());

// Trust Render's proxy so rate-limit works on real IPs
app.set("trust proxy", 1);

// CORS — only allow the configured frontend origin
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limit all API requests (100 req / 15 min per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Stricter rate limit for auth endpoints (10 attempts / 15 min per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});

app.use("/api", apiLimiter);
app.use("/api/admin/signin", authLimiter);
app.use("/api/superadmin/signin", authLimiter);

// Body parsing with size limit to prevent large payload DoS
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Sanitize user input — prevents NoSQL injection ($, . in keys)
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Serve uploaded files
app.use(express.static("uploads"));

// ── Health check (used by Render) ────────────────────────────────────────────
app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api", superadminRoutes);
app.use("/api", adminRoutes);
app.use("/api", production);
app.use("/api", customerDetail);
app.use("/api", vehicalDetail);
app.use("/api", supplairDetail);
app.use("/api", dailyTransportDetail);
app.use("/api", dustAndPowderRawMatirial);
app.use("/api", cementRawMatirial);
app.use("/api", pondAshRawMatirial);
app.use("/api", flyAshRawMatirial);
app.use("/api", chemicalRawMatirial);
app.use("/api", workerSalary);
app.use("/api", maintainesCost);
app.use("/api", sale);
app.use("/api", bill);
app.use("/api", payment);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global error handler (never leak stack traces to client) ──────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
