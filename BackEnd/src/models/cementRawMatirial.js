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
        quantity: {
            type: Number,
            required: true
        },
        pricePerBag: {
            type: Number,
            required: true
        },
        transportCharge: {
            type: Number,
            required: true
        },
        numberOfTon: {
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
module.exports = mongoose.model("cementRawMatirial", userSchema);