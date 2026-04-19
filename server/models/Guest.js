const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add guest name'],
    },
    identityType: {
        type: String,
        enum: ['NIC', 'Passport'],
        required: true,
    },
    identityNumber: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        default: 'Sri Lanka',
    },
    phoneNumber: String,
    email: String,
    documents: [{
        url: String,
        publicId: String, // Useful if using Cloudinary, or just filename for local
        documentType: {
            type: String,
            enum: ['NIC_Front', 'NIC_Back', 'Passport_Main', 'Other'],
        }
    }],
    currentRoom: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
    },
    checkIn: {
        type: Date,
        default: Date.now,
    },
    checkOut: Date,
    totalAmount: Number,
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid'],
        default: 'pending',
    },
    numberOfAdults: {
        type: Number,
        default: 1
    },
    numberOfChildren: {
        type: Number,
        default: 0
    },
    actualPrice: {
        type: Number,
        default: 0
    },
    description: String,
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Guest', guestSchema);
