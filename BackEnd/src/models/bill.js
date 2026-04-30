const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    dateFrom: {
      type: Date,
      required: true,
    },
    dateTo: {
      type: Date,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["draft", "confirmed", "generated"],
      default: "draft",
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    billItems: [
      {
        challanId: {
          type: String,
          required: true,
        },
        challanDate: {
          type: Date,
          required: true,
        },
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
    notes: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("bill", billSchema);
