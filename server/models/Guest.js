const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add guest name'],
    },
    identityType: {
        type: String,
        enum: ['NIC', 'Passport'],
        required: false,
    },
    identityNumber: {
        type: String,
        required: false,
    },
    country: {
        type: String,
        default: 'Sri Lanka',
    },
    phoneNumber: String,
    email: String,
    birthday: Date,
    nationality: {
        type: String,
        default: 'Sri Lankan'
    },
    documents: [{
        url: String,
        publicId: String,
        documentType: {
            type: String,
            enum: ['NIC_Front', 'NIC_Back', 'Passport_Main', 'Other'],
        }
    }],
    bookingPlatform: {
        type: String,
        enum: ['Booking.com', 'Airbnb', 'Agoda', 'Direct Booking'],
        default: 'Direct Booking'
    },
    rooms: [{
        room: {
            type: mongoose.Schema.ObjectId,
            ref: 'Room',
        },
        roomPrice: Number,
        guests: [{
            name: String,
            identityType: {
                type: String,
                enum: ['NIC', 'Passport'],
            },
            identityNumber: String,
            birthday: Date,
            email: String,
            phoneNumber: String,
            nationality: String,
        }]
    }],
    currentRoom: { // Kept for legacy/single room compatibility
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
