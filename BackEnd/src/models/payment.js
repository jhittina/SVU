const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["customer", "supplier", "vehicle", "worker", "maintenance"],
      required: true,
    },
    referenceId: {
      type: String,
      required: true,
    },
    referenceName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "cheque", "upi", "other"],
      default: "cash",
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("payment", paymentSchema);
