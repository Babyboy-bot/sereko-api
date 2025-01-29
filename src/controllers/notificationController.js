const NotificationModel = require('../models/notificationModel');
const NotificationService = require('../services/notificationService');
const winston = require('winston');

class NotificationController {
  static async listerNotifications(req, res) {
    try {
      const utilisateurId = req.user.uid;
      const limite = req.query.limite || 20;

      const notifications = await NotificationModel.listerNotificationsUtilisateur(
        utilisateurId, 
        parseInt(limite)
      );

      res.status(200).json({
        message: 'Notifications récupérées avec succès',
        notifications,
        total: notifications.length
      });
    } catch (error) {
      winston.error('Erreur lors de la récupération des notifications', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des notifications' 
      });
    }
  }

  static async marquerNotificationCommeLue(req, res) {
    try {
      const utilisateurId = req.user.uid;
      const notificationId = req.params.notificationId;

      const notification = await NotificationModel.marquerNotificationCommeLue(
        notificationId, 
        utilisateurId
      );

      if (!notification) {
        return res.status(404).json({ 
          message: 'Notification non trouvée' 
        });
      }

      res.status(200).json({
        message: 'Notification marquée comme lue',
        notification
      });
    } catch (error) {
      winston.error('Erreur lors du marquage de la notification', error);
      res.status(500).json({ 
        message: 'Erreur lors du marquage de la notification' 
      });
    }
  }

  static async enregistrerTokenFCM(req, res) {
    try {
      const utilisateurId = req.user.uid;
      const { fcmToken } = req.body;

      if (!fcmToken) {
        return res.status(400).json({ 
          message: 'Token FCM manquant' 
        });
      }

      // Mettre à jour le token FCM de l'utilisateur dans la base de données
      const query = `
        UPDATE utilisateurs 
        SET fcm_token = $1 
        WHERE id = $2
      `;

      await executeQuery(query, [fcmToken, utilisateurId]);

      res.status(200).json({
        message: 'Token FCM enregistré avec succès'
      });
    } catch (error) {
      winston.error('Erreur lors de l\'enregistrement du token FCM', error);
      res.status(500).json({ 
        message: 'Erreur lors de l\'enregistrement du token FCM' 
      });
    }
  }
}

module.exports = NotificationController;
