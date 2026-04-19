const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    guest: {
        type: mongoose.Schema.ObjectId,
        ref: 'Guest',
        required: true,
    },
    room: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
        required: true,
    },
    amount: {
        type: Number,
        required: [true, 'Please add amount'],
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online'],
        default: 'cash',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    month: {
        type: Number,
        required: true, // 1-12
    },
    year: {
        type: Number,
        required: true,
    },
    description: String,
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    }
});

module.exports = mongoose.model('Income', incomeSchema);
