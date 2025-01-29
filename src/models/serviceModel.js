const { executeQuery } = require('../services/databaseService');
const winston = require('winston');

class ServiceModel {
  static async creerService(donneesService) {
    const {
      prestataire_id,
      titre,
      description,
      categorie,
      tarif_horaire,
      localisation
    } = donneesService;

    try {
      const query = `
        INSERT INTO services 
        (prestataire_id, titre, description, categorie, tarif_horaire, localisation) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
      `;

      const values = [
        prestataire_id,
        titre,
        description,
        categorie,
        tarif_horaire,
        localisation
      ];

      const result = await executeQuery(query, values);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur lors de la création du service', error);
      throw new Error('Impossible de créer le service');
    }
  }

  static async rechercherServices(filtres = {}) {
    try {
      const conditions = [];
      const values = [];
      let index = 1;

      // Construction dynamique des filtres
      if (filtres.categorie) {
        conditions.push(`categorie = $${index}`);
        values.push(filtres.categorie);
        index++;
      }

      if (filtres.localisation) {
        conditions.push(`localisation ILIKE $${index}`);
        values.push(`%${filtres.localisation}%`);
        index++;
      }

      if (filtres.tarif_min) {
        conditions.push(`tarif_horaire >= $${index}`);
        values.push(filtres.tarif_min);
        index++;
      }

      if (filtres.tarif_max) {
        conditions.push(`tarif_horaire <= $${index}`);
        values.push(filtres.tarif_max);
        index++;
      }

      conditions.push('disponible = true');

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const query = `
        SELECT s.*, u.nom, u.prenom 
        FROM services s
        JOIN utilisateurs u ON s.prestataire_id = u.id
        ${whereClause}
        LIMIT 50
      `;

      const result = await executeQuery(query, values);
      return result.rows;
    } catch (error) {
      winston.error('Erreur lors de la recherche de services', error);
      throw new Error('Impossible de rechercher les services');
    }
  }

  static async obtenirServiceParId(serviceId, prestataireId = null) {
    try {
      const conditions = prestataireId 
        ? 'WHERE id = $1 AND prestataire_id = $2' 
        : 'WHERE id = $1';

      const query = `
        SELECT s.*, u.nom, u.prenom 
        FROM services s
        JOIN utilisateurs u ON s.prestataire_id = u.id
        ${conditions}
      `;

      const values = prestataireId 
        ? [serviceId, prestataireId] 
        : [serviceId];

      const result = await executeQuery(query, values);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur lors de la récupération du service', error);
      throw new Error('Impossible de récupérer le service');
    }
  }

  static async mettreAJourService(serviceId, prestataireId, donneesService) {
    const {
      titre,
      description,
      categorie,
      tarif_horaire,
      localisation,
      disponible
    } = donneesService;

    try {
      const query = `
        UPDATE services 
        SET 
          titre = $1, 
          description = $2, 
          categorie = $3, 
          tarif_horaire = $4, 
          localisation = $5,
          disponible = $6
        WHERE id = $7 AND prestataire_id = $8
        RETURNING *
      `;

      const values = [
        titre,
        description,
        categorie,
        tarif_horaire,
        localisation,
        disponible,
        serviceId,
        prestataireId
      ];

      const result = await executeQuery(query, values);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur lors de la mise à jour du service', error);
      throw new Error('Impossible de mettre à jour le service');
    }
  }

  static async supprimerService(serviceId, prestataireId) {
    try {
      const query = `
        DELETE FROM services 
        WHERE id = $1 AND prestataire_id = $2
        RETURNING id
      `;

      const result = await executeQuery(query, [serviceId, prestataireId]);
      return result.rows[0] ? true : false;
    } catch (error) {
      winston.error('Erreur lors de la suppression du service', error);
      throw new Error('Impossible de supprimer le service');
    }
  }
}

module.exports = ServiceModel;
