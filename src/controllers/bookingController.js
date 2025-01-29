const ReservationModel = require('../models/bookingModel');
const ServiceModel = require('../models/serviceModel');
const winston = require('winston');

class ReservationController {
  static async creerReservation(req, res) {
    try {
      const clientId = req.user.uid;
      const {
        service_id,
        date_debut,
        date_fin,
        adresse_prestation,
        details_supplementaires
      } = req.body;

      // Validation des données
      if (!service_id || !date_debut || !date_fin || !adresse_prestation) {
        return res.status(400).json({ 
          message: 'Tous les champs requis ne sont pas remplis' 
        });
      }

      // Vérifier la disponibilité du service
      const estDisponible = await ReservationModel.verifierDisponibilitéService(
        service_id, 
        new Date(date_debut), 
        new Date(date_fin)
      );

      if (!estDisponible) {
        return res.status(409).json({ 
          message: 'Le service est déjà réservé pour cette période' 
        });
      }

      const nouvelleReservation = await ReservationModel.creerReservation({
        client_id: clientId,
        service_id,
        date_debut,
        date_fin,
        adresse_prestation,
        details_supplementaires
      });

      res.status(201).json({
        message: 'Réservation créée avec succès',
        reservation: nouvelleReservation
      });
    } catch (error) {
      winston.error('Erreur lors de la création de la réservation', error);
      res.status(500).json({ 
        message: 'Erreur lors de la création de la réservation' 
      });
    }
  }

  static async listerReservations(req, res) {
    try {
      const utilisateurId = req.user.uid;
      const role = req.user.role;

      const reservations = await ReservationModel.obtenirReservationsUtilisateur(
        utilisateurId, 
        role
      );

      res.status(200).json({
        message: 'Réservations récupérées avec succès',
        reservations,
        total: reservations.length
      });
    } catch (error) {
      winston.error('Erreur lors de la récupération des réservations', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des réservations' 
      });
    }
  }

  static async mettreAJourStatutReservation(req, res) {
    try {
      const prestataireId = req.user.uid;
      const reservationId = req.params.reservationId;
      const { statut } = req.body;

      const statuts_valides = [
        'en_attente', 
        'confirmee', 
        'en_cours', 
        'terminee', 
        'disputee'
      ];

      if (!statuts_valides.includes(statut)) {
        return res.status(400).json({ 
          message: 'Statut de réservation invalide' 
        });
      }

      const reservationMiseAJour = await ReservationModel.mettreAJourStatutReservation(
        reservationId, 
        prestataireId, 
        statut
      );

      if (!reservationMiseAJour) {
        return res.status(404).json({ 
          message: 'Réservation non trouvée ou non autorisée' 
        });
      }

      res.status(200).json({
        message: 'Statut de réservation mis à jour avec succès',
        reservation: reservationMiseAJour
      });
    } catch (error) {
      winston.error('Erreur lors de la mise à jour du statut de réservation', error);
      res.status(500).json({ 
        message: 'Erreur lors de la mise à jour du statut de réservation' 
      });
    }
  }

  static async annulerReservation(req, res) {
    try {
      const utilisateurId = req.user.uid;
      const role = req.user.role;
      const reservationId = req.params.reservationId;

      const reservationAnnulee = await ReservationModel.annulerReservation(
        reservationId, 
        utilisateurId, 
        role
      );

      if (!reservationAnnulee) {
        return res.status(404).json({ 
          message: 'Réservation non trouvée ou non autorisée' 
        });
      }

      res.status(200).json({
        message: 'Réservation annulée avec succès',
        reservation: reservationAnnulee
      });
    } catch (error) {
      winston.error('Erreur lors de l\'annulation de la réservation', error);
      res.status(500).json({ 
        message: 'Erreur lors de l\'annulation de la réservation' 
      });
    }
  }
}

module.exports = ReservationController;
