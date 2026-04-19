const express = require('express');
const { getRooms, getRoom, createRoom, updateRoom, deleteRoom } = require('../controllers/room.controller');
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

router.route('/')
    .get(protect, getRooms)
    .post(protect, authorize('super-admin'), createRoom);

router.route('/:id')
    .get(protect, getRoom)
    .put(protect, authorize('super-admin', 'admin'), updateRoom)
    .delete(protect, authorize('super-admin'), deleteRoom);

module.exports = router;
