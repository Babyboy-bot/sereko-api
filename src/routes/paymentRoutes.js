const express = require('express');
const { authenticateUser, authorizeRole } = require('../middleware/authMiddleware');
const { PaiementController, PaymentController } = require('../controllers/paymentController');

const router = express.Router();

// Routes protégées pour les clients
router.post('/initialiser', 
  authenticateUser, 
  authorizeRole(['client']), 
  PaiementController.initialiserPaiement
);

// Webhook public pour Paystack
router.post('/webhook', PaiementController.webhookPaystack);

// Nouvelles routes Wave
router.post('/wave/initiate', PaymentController.processWavePayment);
router.get('/wave/verify/:transactionId', PaymentController.verifyWavePayment);

module.exports = router;
