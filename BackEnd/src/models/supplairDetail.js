const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        address: {
            type: Array,
            required: true
        },
        matirialType: {
            type: String,
            required: true

        },
        poNumber: {
            type: String,
        },
        price: {
            type: Number,
            required: true
        },
        conatctNumber: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("supplairDetail", userSchema);