const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a room name/number'],
        unique: true,
    },
    type: {
        type: String,
        enum: ['room', 'house'],
        default: 'room',
    },
    pricePerNight: {
        type: Number,
        required: [true, 'Please add a price per night'],
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available',
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Room', roomSchema);
