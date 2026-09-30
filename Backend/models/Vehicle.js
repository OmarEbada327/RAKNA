const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100,
        match: /^[\p{L}\p{N}][\p{L}\p{N}\s.,'()/\-]{2,99}$/u
    },
    car_number: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
        match: /^[\p{L}\p{N}][\p{L}\p{N}\s-]{2,19}$/u
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