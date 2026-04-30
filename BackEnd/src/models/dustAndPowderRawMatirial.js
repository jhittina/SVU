const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true
        },
        quantityUnit: {
            type: String,
            required: true
        },
        rawMatirialType: {
            type: String,
            required: true

        },
        vehicalNumber: {
            type: String,
            required: true
        },
        pricePerQuantity: {
            type: Number,
            required: true
        },
        Date: {
            type: Date,
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("dustAndPowderRawMatirial", userSchema);