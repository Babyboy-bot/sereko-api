const { executeQuery } = require('../services/databaseService');
const winston = require('winston');

class PaiementModel {
  static async enregistrerPaiement(donneePaiement) {
    const {
      reservation_id,
      reference_paystack,
      montant,
      statut,
      email_client
    } = donneePaiement;

    try {
      const query = `
        INSERT INTO paiements 
        (reservation_id, reference_paystack, montant, statut, email_client, date_paiement) 
        VALUES ($1, $2, $3, $4, $5, NOW()) 
        RETURNING *
      `;

      const values = [
        reservation_id,
        reference_paystack,
        montant,
        statut,
        email_client
      ];

      const result = await executeQuery(query, values);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur lors de l\'enregistrement du paiement', error);
      throw new Error('Impossible d\'enregistrer le paiement');
    }
  }

  static async mettreAJourStatutPaiement(reference, statut) {
    try {
      const query = `
        UPDATE paiements 
        SET statut = $1 
        WHERE reference_paystack = $2 
        RETURNING *
      `;

      const result = await executeQuery(query, [statut, reference]);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur lors de la mise à jour du statut de paiement', error);
      throw new Error('Impossible de mettre à jour le statut du paiement');
    }
  }

  static async obtenirPaiementParReference(reference) {
    try {
      const query = `
        SELECT * FROM paiements 
        WHERE reference_paystack = $1
      `;

      const result = await executeQuery(query, [reference]);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur lors de la récupération du paiement', error);
      throw new Error('Impossible de récupérer le paiement');
    }
  }
}

module.exports = PaiementModel;
