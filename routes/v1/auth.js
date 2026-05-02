const express = require('express');
const router = express.Router();

const authController = require('../../controllers/authController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

// Public route
router.post('/login', asyncHandler(authController.login));

// Protected routes
router.use(verifyToken);
router.post('/logout', asyncHandler(authController.logout));
router.post('/verify-token', asyncHandler(authController.verifyToken));

module.exports = router;
