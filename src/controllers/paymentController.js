const PaymentService = require('../services/paymentService');
const PaiementModel = require('../models/paymentModel');
const ReservationModel = require('../models/bookingModel');
const winston = require('winston');
const WavePaymentService = require('../services/wavePaymentService');

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

class PaymentController {
  constructor() {
    this.waveService = new WavePaymentService(process.env.WAVE_API_KEY);
  }

  async processWavePayment(req, res) {
    const { amount, userPhone, description } = req.body;

    try {
      const paymentResult = await this.waveService.initiatePayment(
        amount, 
        userPhone, 
        description
      );

      if (paymentResult.success) {
        res.status(200).json({
          message: 'Payment initiated successfully',
          transactionId: paymentResult.transactionId
        });
      } else {
        res.status(400).json({
          message: 'Payment failed',
          error: paymentResult.error
        });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  async verifyWavePayment(req, res) {
    const { transactionId } = req.params;

    try {
      const verificationResult = await this.waveService.verifyPayment(transactionId);

      if (verificationResult.success) {
        res.status(200).json({
          message: 'Payment verified',
          status: verificationResult.status,
          amount: verificationResult.amount
        });
      } else {
        res.status(400).json({
          message: 'Payment verification failed',
          error: verificationResult.error
        });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = { PaiementController, PaymentController: new PaymentController() };
