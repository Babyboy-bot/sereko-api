const express = require('express');
const { authenticateUser, authorizeRole } = require('../middleware/authMiddleware');
const ServiceController = require('../controllers/serviceController');

const router = express.Router();

// Routes publiques
router.get('/recherche', ServiceController.rechercherServices);
router.get('/:serviceId', ServiceController.obtenirDetailsService);

// Routes protégées pour les prestataires
router.post('/', authenticateUser, authorizeRole(['prestataire']), ServiceController.creerService);
router.put('/:serviceId', authenticateUser, authorizeRole(['prestataire']), ServiceController.mettreAJourService);
router.delete('/:serviceId', authenticateUser, authorizeRole(['prestataire']), ServiceController.supprimerService);

module.exports = router;
