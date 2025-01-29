const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const winston = require('winston');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async envoyerNotificationPush(token, titre, corps, donnees = {}) {
    try {
      const message = {
        notification: { title: titre, body: corps },
        token: token,
        data: donnees
      };

      const response = await admin.messaging().send(message);
      winston.info('Notification push envoyée avec succès', response);
      return response;
    } catch (error) {
      winston.error('Erreur lors de l\'envoi de la notification push', error);
      throw error;
    }
  }

  async envoyerEmail(destinataire, sujet, corps) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: destinataire,
        subject: sujet,
        html: corps
      };

      const info = await this.transporter.sendMail(mailOptions);
      winston.info('Email envoyé avec succès', info);
      return info;
    } catch (error) {
      winston.error('Erreur lors de l\'envoi de l\'email', error);
      throw error;
    }
  }

  async notifierReservation(utilisateur, reservation, statut) {
    const titreStatut = {
      'en_attente': 'Nouvelle Réservation',
      'confirmee': 'Réservation Confirmée',
      'en_cours': 'Réservation en Cours',
      'terminee': 'Réservation Terminée',
      'annulee': 'Réservation Annulée'
    };

    const messageStatut = {
      'en_attente': 'Une nouvelle réservation a été créée.',
      'confirmee': 'Votre réservation a été confirmée.',
      'en_cours': 'La prestation est en cours.',
      'terminee': 'La prestation est terminée.',
      'annulee': 'La réservation a été annulée.'
    };

    try {
      // Notification Push
      if (utilisateur.fcmToken) {
        await this.envoyerNotificationPush(
          utilisateur.fcmToken, 
          titreStatut[statut], 
          messageStatut[statut],
          { reservationId: reservation.id.toString() }
        );
      }

      // Email
      const corpsEmail = `
        <h1>${titreStatut[statut]}</h1>
        <p>${messageStatut[statut]}</p>
        <p>Détails de la réservation :</p>
        <ul>
          <li>Service : ${reservation.titre_service}</li>
          <li>Date : ${new Date(reservation.date_debut).toLocaleString()}</li>
          <li>Montant : ${reservation.montant_total} FCFA</li>
        </ul>
      `;

      await this.envoyerEmail(
        utilisateur.email, 
        titreStatut[statut], 
        corpsEmail
      );

    } catch (error) {
      winston.error('Erreur lors de la notification de réservation', error);
    }
  }
}

module.exports = new NotificationService();
