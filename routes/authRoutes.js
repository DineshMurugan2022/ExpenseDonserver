const express = require('express');
const { register, login, getMe, updateProfile, verifyEmail, refreshToken, logout, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
// Verification is handled by Supabase redirect
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.delete('/account', protect, deleteAccount);

module.exports = router;
