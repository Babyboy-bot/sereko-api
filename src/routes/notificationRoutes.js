const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const NotificationController = require('../controllers/notificationController');

const router = express.Router();

// Routes protégées
router.get('/', authenticateUser, NotificationController.listerNotifications);
router.put('/:notificationId/lu', authenticateUser, NotificationController.marquerNotificationCommeLue);
router.post('/fcm-token', authenticateUser, NotificationController.enregistrerTokenFCM);

module.exports = router;
