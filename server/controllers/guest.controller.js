const Guest = require('../models/Guest');
const Room = require('../models/Room');
const Income = require('../models/Income');

// @desc    Get all guests
// @route   GET /api/v1/guests
// @access  Private
exports.getGuests = async (req, res, next) => {
    try {
        const guests = await Guest.find().populate('currentRoom').populate('rooms.room');
        
        // Normalize data for frontend: move legacy currentRoom to rooms array if empty
        const normalizedGuests = guests.map(g => {
            const guestObj = g.toObject();
            if ((!guestObj.rooms || guestObj.rooms.length === 0) && guestObj.currentRoom) {
                guestObj.rooms = [{
                    room: guestObj.currentRoom,
                    guests: [{
                        name: guestObj.name,
                        identityType: guestObj.identityType,
                        identityNumber: guestObj.identityNumber
                    }]
                }];
            }
            return guestObj;
        });

        res.status(200).json({ success: true, count: normalizedGuests.length, data: normalizedGuests });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single guest
// @route   GET /api/v1/guests/:id
// @access  Private
exports.getGuest = async (req, res, next) => {
    try {
        const guest = await Guest.findById(req.params.id).populate('currentRoom').populate('rooms.room');
        if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });
        
        const guestObj = guest.toObject();
        if ((!guestObj.rooms || guestObj.rooms.length === 0) && guestObj.currentRoom) {
            guestObj.rooms = [{
                room: guestObj.currentRoom,
                guests: [{
                    name: guestObj.name,
                    identityType: guestObj.identityType,
                    identityNumber: guestObj.identityNumber
                }]
            }];
        }

        res.status(200).json({ success: true, data: guestObj });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create guest
// @route   POST /api/v1/guests
// @access  Private
exports.createGuest = async (req, res, next) => {
    try {
        let guestData = req.body;
        
        // Handle parsing nested rooms if sent as string (from FormData)
        if (typeof guestData.rooms === 'string') {
            try {
                guestData.rooms = JSON.parse(guestData.rooms);
            } catch (e) {
                console.error('Failed to parse rooms string');
            }
        }

        // Handle files if uploaded
        if (req.files && req.files.length > 0) {
            guestData.documents = req.files.map((file, index) => ({
                url: `/uploads/${file.filename}`,
                documentType: index === 0 ? 'NIC_Front' : (index === 1 ? 'NIC_Back' : 'Other')
            }));
        }

        const guest = await Guest.create(guestData);

        // If paid, create income record
        if (guest.paymentStatus === 'paid' && guest.totalAmount > 0) {
            const now = new Date();
            // Use the first room as the reference for income
            const primaryRoom = guest.rooms && guest.rooms.length > 0 ? guest.rooms[0].room : guest.currentRoom;
            
            await Income.create({
                guest: guest._id,
                room: primaryRoom,
                amount: guest.totalAmount,
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                createdBy: req.user._id,
                description: `Group payment for guest ${guest.name} (${guest.rooms?.length || 0} rooms)`
            });
        }

        res.status(201).json({ success: true, data: guest });
    } catch (err) {
        console.error('Create error:', err);
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

        let updateData = req.body;
        
        // Handle parsing nested rooms if sent as string (from FormData)
        if (typeof updateData.rooms === 'string') {
            try {
                updateData.rooms = JSON.parse(updateData.rooms);
            } catch (e) {
                console.error('Failed to parse rooms string');
            }
        }

        console.log('--- BACKEND UPDATE START ---');
        console.log('ID:', req.params.id);
        console.log('UPDATING FIELDS:', Object.keys(updateData));

        // Explicitly map fields to ensure they are set on the document
        Object.keys(updateData).forEach(key => {
            console.log(`Setting ${key} =`, updateData[key]);
            guest[key] = updateData[key];
        });

        // Handle additional files if uploaded (multipart only)
        if (req.files && req.files.length > 0) {
            const newDocs = req.files.map(file => ({
                url: `/uploads/${file.filename}`,
                documentType: 'Other'
            }));
            guest.documents = [...(guest.documents || []), ...newDocs];
        }

        // Save the document (triggers validation and schema defaults)
        const updatedGuest = await guest.save();

        // Financial Synchronization Logic
        if (updatedGuest.paymentStatus === 'paid' && updatedGuest.totalAmount > 0) {
            const now = new Date();
            const primaryRoom = updatedGuest.rooms && updatedGuest.rooms.length > 0 ? updatedGuest.rooms[0].room : updatedGuest.currentRoom;
            
            // Check if income record exists
            const existingIncome = await Income.findOne({ guest: updatedGuest._id });
            
            if (existingIncome) {
                // Update existing record
                existingIncome.amount = updatedGuest.totalAmount;
                existingIncome.room = primaryRoom;
                await existingIncome.save();
            } else {
                // Create new record
                await Income.create({
                    guest: updatedGuest._id,
                    room: primaryRoom,
                    amount: updatedGuest.totalAmount,
                    month: now.getMonth() + 1,
                    year: now.getFullYear(),
                    createdBy: req.user._id,
                    description: `Automated payment record for ${updatedGuest.name}`
                });
            }
        } else if (updatedGuest.paymentStatus !== 'paid') {
            // Optional: Remove income record if guest is unmarked as paid? 
            // Better to keep it for auditing or just ignore. 
            // For now, let's just make sure 'paid' records are accurate.
        }

        console.log('SAVE SUCCESSFUL. New adults:', updatedGuest.numberOfAdults);
        res.status(200).json({ success: true, data: updatedGuest });
    } catch (err) {
        console.error('SAVE FAILED:', err.message);
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

        await guest.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
