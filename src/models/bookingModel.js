const { executeQuery } = require('../services/databaseService');
const ServiceModel = require('./serviceModel');
const winston = require('winston');

class ReservationModel {
  static async creerReservation(donneesReservation) {
    const {
      client_id,
      service_id,
      date_debut,
      date_fin,
      adresse_prestation,
      details_supplementaires
    } = donneesReservation;

    try {
      // Récupérer les détails du service
      const service = await ServiceModel.obtenirServiceParId(service_id);
      
      if (!service) {
        throw new Error('Service non trouvé');
      }

      // Calculer le nombre d'heures et le montant total
      const dateDebut = new Date(date_debut);
      const dateFin = new Date(date_fin);
      const nombreHeures = (dateFin - dateDebut) / (1000 * 60 * 60);
      const montantTotal = nombreHeures * service.tarif_horaire;

      const query = `
        INSERT INTO reservations 
        (client_id, service_id, prestataire_id, date_debut, date_fin, nombre_heures, montant_total, adresse_prestation, details_supplementaires) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *
      `;

      const values = [
        client_id,
        service_id,
        service.prestataire_id,
        dateDebut,
        dateFin,
        nombreHeures,
        montantTotal,
        adresse_prestation,
        details_supplementaires
      ];

      const result = await executeQuery(query, values);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur lors de la création de la réservation', error);
      throw new Error('Impossible de créer la réservation');
    }
  }

  static async obtenirReservationsUtilisateur(utilisateurId, role = 'client') {
    try {
      const colonne = role === 'prestataire' ? 'prestataire_id' : 'client_id';

      const query = `
        SELECT r.*, 
               s.titre AS titre_service, 
               u.nom AS nom_utilisateur, 
               u.prenom AS prenom_utilisateur
        FROM reservations r
        JOIN services s ON r.service_id = s.id
        JOIN utilisateurs u ON r.${role === 'prestataire' ? 'client_id' : 'prestataire_id'} = u.id
        WHERE r.${colonne} = $1
        ORDER BY r.date_creation DESC
      `;

      const result = await executeQuery(query, [utilisateurId]);
      return result.rows;
    } catch (error) {
      winston.error('Erreur lors de la récupération des réservations', error);
      throw new Error('Impossible de récupérer les réservations');
    }
  }

  static async mettreAJourStatutReservation(reservationId, prestataireId, nouveauStatut) {
    try {
      const query = `
        UPDATE reservations 
        SET statut = $1 
        WHERE id = $2 AND prestataire_id = $3
        RETURNING *
      `;

      const result = await executeQuery(query, [nouveauStatut, reservationId, prestataireId]);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur lors de la mise à jour du statut de réservation', error);
      throw new Error('Impossible de mettre à jour le statut de réservation');
    }
  }

  static async verifierDisponibilitéService(serviceId, dateDebut, dateFin) {
    try {
      const query = `
        SELECT COUNT(*) AS conflits
        FROM reservations r
        WHERE r.service_id = $1 
        AND (
          (r.date_debut <= $2 AND r.date_fin >= $2) OR
          (r.date_debut <= $3 AND r.date_fin >= $3) OR
          (r.date_debut >= $2 AND r.date_fin <= $3)
        )
        AND r.statut NOT IN ('annulee', 'terminee')
      `;

      const result = await executeQuery(query, [serviceId, dateDebut, dateFin]);
      return parseInt(result.rows[0].conflits) === 0;
    } catch (error) {
      winston.error('Erreur lors de la vérification de disponibilité', error);
      throw new Error('Impossible de vérifier la disponibilité');
    }
  }

  static async annulerReservation(reservationId, utilisateurId, role) {
    try {
      const colonne = role === 'prestataire' ? 'prestataire_id' : 'client_id';

      const query = `
        UPDATE reservations 
        SET statut = 'annulee' 
        WHERE id = $1 AND ${colonne} = $2
        RETURNING *
      `;

      const result = await executeQuery(query, [reservationId, utilisateurId]);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur lors de l\'annulation de la réservation', error);
      throw new Error('Impossible d\'annuler la réservation');
    }
  }
}

module.exports = ReservationModel;
