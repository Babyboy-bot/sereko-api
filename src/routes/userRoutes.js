const express = require('express');
const { authenticateUser, authorizeRole } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes
router.get('/profile', authenticateUser, userController.getUserProfile);
router.put('/profile', authenticateUser, userController.updateUserProfile);

// Admin routes
router.get('/', authenticateUser, authorizeRole(['admin']), userController.listUsers);
router.delete('/:userId', authenticateUser, authorizeRole(['admin']), userController.deleteUser);

module.exports = router;
