const Guest = require('../models/Guest');
const Room = require('../models/Room');
const Income = require('../models/Income');

// @desc    Get all guests
// @route   GET /api/v1/guests
// @access  Private
exports.getGuests = async (req, res, next) => {
    try {
        const guests = await Guest.find().populate('currentRoom');
        res.status(200).json({ success: true, count: guests.length, data: guests });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single guest
// @route   GET /api/v1/guests/:id
// @access  Private
exports.getGuest = async (req, res, next) => {
    try {
        const guest = await Guest.findById(req.params.id).populate('currentRoom');
        if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });
        res.status(200).json({ success: true, data: guest });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create guest
// @route   POST /api/v1/guests
// @access  Private
exports.createGuest = async (req, res, next) => {
    try {
        const guestData = req.body;
        
        // Handle files if uploaded
        if (req.files && req.files.length > 0) {
            guestData.documents = req.files.map((file, index) => ({
                url: `/uploads/${file.filename}`,
                documentType: index === 0 ? 'NIC_Front' : (index === 1 ? 'NIC_Back' : 'Other')
            }));
        }

        const guest = await Guest.create(guestData);

        // Update room status
        if (guest.currentRoom) {
            await Room.findByIdAndUpdate(guest.currentRoom, { status: 'occupied' });
        }

        // If paid, create income record
        if (guest.paymentStatus === 'paid' && guest.totalAmount > 0) {
            const now = new Date();
            await Income.create({
                guest: guest._id,
                room: guest.currentRoom,
                amount: guest.totalAmount,
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                createdBy: req.user._id,
                description: `Payment for guest ${guest.name}`
            });
        }

        res.status(201).json({ success: true, data: guest });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update guest
// @route   PUT /api/v1/guests/:id
// @access  Private
exports.updateGuest = async (req, res, next) => {
    try {
        let guest = await Guest.findById(req.params.id);
        if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });

        const updateData = req.body;

        // Handle additional files if uploaded
        if (req.files && req.files.length > 0) {
            const newDocs = req.files.map(file => ({
                url: `/uploads/${file.filename}`,
                documentType: 'Other'
            }));
            updateData.documents = [...(guest.documents || []), ...newDocs];
        }

        guest = await Guest.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        // Handle Room status change if needed (checkout)
        if (updateData.checkOut) {
            await Room.findByIdAndUpdate(guest.currentRoom, { status: 'available' });
        }

        res.status(200).json({ success: true, data: guest });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete guest
// @route   DELETE /api/v1/guests/:id
// @access  Private/SuperAdmin
exports.deleteGuest = async (req, res, next) => {
    try {
        const guest = await Guest.findById(req.params.id);
        if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });

        // Update room to available before deleting
        if (guest.currentRoom) {
            await Room.findByIdAndUpdate(guest.currentRoom, { status: 'available' });
        }

        await guest.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
