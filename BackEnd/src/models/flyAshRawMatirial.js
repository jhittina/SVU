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
        vehicalNumber: {
            type: String,
            required: true
        },
        numberOfTon: {
            type: Number,
            required: true
        },
        pricePerTon: {
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
module.exports = mongoose.model("flyAshRawMatirial", userSchema);