const PaymentService = require('../services/paymentService');
const PaiementModel = require('../models/paymentModel');
const ReservationModel = require('../models/bookingModel');
const winston = require('winston');

class PaiementController {
  static async initialiserPaiement(req, res) {
    try {
      const { reservation_id } = req.body;
      const utilisateur = req.user;

      // Récupérer les détails de la réservation
      const reservations = await ReservationModel.obtenirReservationsUtilisateur(
        utilisateur.uid, 
        'client'
      );

      const reservation = reservations.find(r => r.id === parseInt(reservation_id));

      if (!reservation) {
        return res.status(404).json({ 
          message: 'Réservation non trouvée' 
        });
      }

      // Générer une référence unique
      const reference = PaymentService.genererReferenceUnique();

      // Initialiser le paiement avec Paystack
      const paiement = await PaymentService.initialiserPaiement(
        reservation.montant_total, 
        utilisateur.email, 
        reference
      );

      // Enregistrer les détails du paiement
      await PaiementModel.enregistrerPaiement({
        reservation_id: reservation.id,
        reference_paystack: reference,
        montant: reservation.montant_total,
        statut: 'en_attente',
        email_client: utilisateur.email
      });

      res.status(200).json({
        message: 'Paiement initialisé avec succès',
        authorization_url: paiement.data.authorization_url,
        reference: reference
      });
    } catch (error) {
      winston.error('Erreur lors de l\'initialisation du paiement', error);
      res.status(500).json({ 
        message: 'Erreur lors de l\'initialisation du paiement' 
      });
    }
  }

  static async webhookPaystack(req, res) {
    try {
      const payload = req.body;

      // Vérifier l'événement
      if (payload.event === 'charge.success') {
        const reference = payload.data.reference;
        
        // Vérifier le paiement avec Paystack
        const verification = await PaymentService.verifierPaiement(reference);

        if (verification.data.status === 'success') {
          // Mettre à jour le statut du paiement
          await PaiementModel.mettreAJourStatutPaiement(reference, 'confirme');

          // Mettre à jour le statut de la réservation
          const paiement = await PaiementModel.obtenirPaiementParReference(reference);
          await ReservationModel.mettreAJourStatutReservation(
            paiement.reservation_id, 
            null, 
            'confirmee'
          );
        }
      }

      res.status(200).send('Webhook reçu');
    } catch (error) {
      winston.error('Erreur lors du traitement du webhook Paystack', error);
      res.status(500).send('Erreur du webhook');
    }
  }
}

module.exports = PaiementController;
