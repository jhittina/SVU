const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        name: {
            type: String,
            required: true
        },
        noLiter: {
            type: Number,
            required: true
        },
        pricePerLiter: {
            type: Number,
            required: true
        },
        transportCharge: {
            type: Number,
            required: true
        },
        gstAmount: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("chemicalRawMatirial", userSchema);