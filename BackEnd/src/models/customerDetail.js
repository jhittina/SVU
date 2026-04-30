const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: Array,
      schema: {
        brickType: {
          type: String,
        },
        address: {
          type: String,
        },
        price: {
          type: Number,
        },
        priceHistory: {
          type: Array,
          schema: {
            price: { type: Number },
            effectiveDate: { type: Date },
            note: { type: String },
          },
        },
      },
    },
    poNumber: {
      type: String,
    },
    contactNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("customerDetail", userSchema);
