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
        Resion: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("maintainesCost", userSchema);