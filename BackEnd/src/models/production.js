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
        quantity: {
            type: Number,
            required: true

        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("production", userSchema);