const express = require('express');
const { login, getMe, register, getUsers } = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

router.post('/login', login);
router.post('/register', protect, authorize('super-admin'), register);
router.get('/users', protect, authorize('super-admin'), getUsers);
router.get('/me', protect, getMe);

module.exports = router;
