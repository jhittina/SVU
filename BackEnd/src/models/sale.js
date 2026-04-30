const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    poNumber: {
      type: String,
      required: false,
    },
    vehicleNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "confirmed"],
      default: "draft",
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    saleDetail: [
      {
        brickName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        rate: {
          type: Number,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("sale", userSchema);
