const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        typeOfBrick: {
            type: String,
            required: true
        },
        noOfPlates: {
            type: Number,
            required: true

        },
        pricePerPlate: {
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

module.exports = mongoose.model("workerSalary", userSchema);