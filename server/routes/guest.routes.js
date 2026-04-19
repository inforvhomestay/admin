const express = require('express');
const { getGuests, getGuest, createGuest, updateGuest, deleteGuest } = require('../controllers/guest.controller');
const { protect, authorize } = require('../middleware/auth.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `guest-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

const router = express.Router();

router.route('/')
    .get(protect, getGuests)
    .post(protect, upload.array('photos', 5), createGuest);

router.route('/:id')
    .get(protect, getGuest)
    .put(protect, upload.array('photos', 5), updateGuest)
    .delete(protect, authorize('super-admin'), deleteGuest);

module.exports = router;
