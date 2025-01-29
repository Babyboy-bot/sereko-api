const express = require('express');
const { authenticateUser, authorizeRole } = require('../middleware/authMiddleware');
const PaiementController = require('../controllers/paymentController');

const router = express.Router();

// Routes protégées pour les clients
router.post('/initialiser', 
  authenticateUser, 
  authorizeRole(['client']), 
  PaiementController.initialiserPaiement
);

// Webhook public pour Paystack
router.post('/webhook', PaiementController.webhookPaystack);

module.exports = router;
