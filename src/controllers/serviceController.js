const ServiceModel = require('../models/serviceModel');
const winston = require('winston');

class ServiceController {
  static async creerService(req, res) {
    try {
      const prestataireId = req.user.uid;
      const {
        titre,
        description,
        categorie,
        tarif_horaire,
        localisation
      } = req.body;

      // Validation des données
      if (!titre || !description || !categorie || !tarif_horaire || !localisation) {
        return res.status(400).json({ 
          message: 'Tous les champs sont obligatoires' 
        });
      }

      const nouveauService = await ServiceModel.creerService({
        prestataire_id: prestataireId,
        titre,
        description,
        categorie,
        tarif_horaire,
        localisation
      });

      res.status(201).json({
        message: 'Service créé avec succès',
        service: nouveauService
      });
    } catch (error) {
      winston.error('Erreur lors de la création du service', error);
      res.status(500).json({ 
        message: 'Erreur lors de la création du service' 
      });
    }
  }

  static async rechercherServices(req, res) {
    try {
      const { 
        categorie, 
        localisation, 
        tarif_min, 
        tarif_max 
      } = req.query;

      const filtres = {
        categorie,
        localisation,
        tarif_min: parseFloat(tarif_min),
        tarif_max: parseFloat(tarif_max)
      };

      const services = await ServiceModel.rechercherServices(filtres);

      res.status(200).json({
        message: 'Recherche de services réussie',
        resultats: services,
        total: services.length
      });
    } catch (error) {
      winston.error('Erreur lors de la recherche de services', error);
      res.status(500).json({ 
        message: 'Erreur lors de la recherche de services' 
      });
    }
  }

  static async obtenirDetailsService(req, res) {
    try {
      const serviceId = req.params.serviceId;

      const service = await ServiceModel.obtenirServiceParId(serviceId);

      if (!service) {
        return res.status(404).json({ 
          message: 'Service non trouvé' 
        });
      }

      res.status(200).json({
        message: 'Détails du service récupérés',
        service
      });
    } catch (error) {
      winston.error('Erreur lors de la récupération des détails du service', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des détails du service' 
      });
    }
  }

  static async mettreAJourService(req, res) {
    try {
      const serviceId = req.params.serviceId;
      const prestataireId = req.user.uid;
      const {
        titre,
        description,
        categorie,
        tarif_horaire,
        localisation,
        disponible
      } = req.body;

      const serviceExistant = await ServiceModel.obtenirServiceParId(serviceId, prestataireId);

      if (!serviceExistant) {
        return res.status(404).json({ 
          message: 'Service non trouvé ou vous n\'êtes pas autorisé' 
        });
      }

      const serviceMisAJour = await ServiceModel.mettreAJourService(serviceId, prestataireId, {
        titre,
        description,
        categorie,
        tarif_horaire,
        localisation,
        disponible
      });

      res.status(200).json({
        message: 'Service mis à jour avec succès',
        service: serviceMisAJour
      });
    } catch (error) {
      winston.error('Erreur lors de la mise à jour du service', error);
      res.status(500).json({ 
        message: 'Erreur lors de la mise à jour du service' 
      });
    }
  }

  static async supprimerService(req, res) {
    try {
      const serviceId = req.params.serviceId;
      const prestataireId = req.user.uid;

      const serviceExistant = await ServiceModel.obtenirServiceParId(serviceId, prestataireId);

      if (!serviceExistant) {
        return res.status(404).json({ 
          message: 'Service non trouvé ou vous n\'êtes pas autorisé' 
        });
      }

      const resultat = await ServiceModel.supprimerService(serviceId, prestataireId);

      if (resultat) {
        res.status(200).json({
          message: 'Service supprimé avec succès'
        });
      } else {
        res.status(500).json({ 
          message: 'Impossible de supprimer le service' 
        });
      }
    } catch (error) {
      winston.error('Erreur lors de la suppression du service', error);
      res.status(500).json({ 
        message: 'Erreur lors de la suppression du service' 
      });
    }
  }
}

module.exports = ServiceController;
