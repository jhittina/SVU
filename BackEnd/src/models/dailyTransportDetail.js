const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        type: {
            type: String,
            required: true
        },
        trip: {
            type: Number,
            required: true
        },
        vehicalNumber: {
            type: String,
            required: true
        },
        perTrip: {
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

module.exports = mongoose.model("dailyTransportDetail", userSchema);