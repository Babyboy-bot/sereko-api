const express = require('express');
const { authenticateUser, authorizeRole } = require('../middleware/authMiddleware');
const ReservationController = require('../controllers/bookingController');

const router = express.Router();

// Routes protégées pour les clients
router.post('/', authenticateUser, authorizeRole(['client']), ReservationController.creerReservation);
router.get('/', authenticateUser, ReservationController.listerReservations);
router.delete('/:reservationId', authenticateUser, ReservationController.annulerReservation);

// Routes protégées pour les prestataires
router.put('/:reservationId/statut', 
  authenticateUser, 
  authorizeRole(['prestataire']), 
  ReservationController.mettreAJourStatutReservation
);

module.exports = router;
