const express = require('express');
const { login, getMe, register, getUsers, deleteUser, resetPassword } = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

router.post('/login', login);
router.post('/register', protect, authorize('super-admin'), register);
router.get('/users', protect, authorize('super-admin'), getUsers);
router.delete('/users/:id', protect, authorize('super-admin'), deleteUser);
router.put('/users/:id/reset-password', protect, authorize('super-admin'), resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
