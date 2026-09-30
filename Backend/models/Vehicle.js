const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    car_number: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    parking_slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ParkingSlot",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);