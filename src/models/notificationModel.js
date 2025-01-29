const { executeQuery } = require('../services/databaseService');
const winston = require('winston');

class NotificationModel {
  static async enregistrerNotification(donneesNotification) {
    const {
      utilisateur_id,
      type,
      titre,
      message,
      reference_entite,
      est_lu
    } = donneesNotification;

    try {
      const query = `
        INSERT INTO notifications 
        (utilisateur_id, type, titre, message, reference_entite, est_lu, date_creation) 
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
        RETURNING *
      `;

      const values = [
        utilisateur_id,
        type,
        titre,
        message,
        reference_entite,
        est_lu || false
      ];

      const result = await executeQuery(query, values);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur lors de l\'enregistrement de la notification', error);
      throw new Error('Impossible d\'enregistrer la notification');
    }
  }

  static async listerNotificationsUtilisateur(utilisateurId, limite = 20) {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE utilisateur_id = $1 
        ORDER BY date_creation DESC 
        LIMIT $2
      `;

      const result = await executeQuery(query, [utilisateurId, limite]);
      return result.rows;
    } catch (error) {
      winston.error('Erreur lors de la récupération des notifications', error);
      throw new Error('Impossible de récupérer les notifications');
    }
  }

  static async marquerNotificationCommeLue(notificationId, utilisateurId) {
    try {
      const query = `
        UPDATE notifications 
        SET est_lu = true 
        WHERE id = $1 AND utilisateur_id = $2 
        RETURNING *
      `;

      const result = await executeQuery(query, [notificationId, utilisateurId]);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur lors du marquage de la notification', error);
      throw new Error('Impossible de marquer la notification');
    }
  }
}

module.exports = NotificationModel;
