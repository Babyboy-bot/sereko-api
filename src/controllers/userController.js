const UserModel = require('../models/userModel');
const winston = require('winston');
const admin = require('firebase-admin');

class UserController {
  static async registerUser(req, res) {
    try {
      const { 
        email, 
        password, 
        nom, 
        prenom, 
        telephone, 
        type_utilisateur 
      } = req.body;

      // Validation des données
      if (!email || !password || !nom || !prenom || !telephone || !type_utilisateur) {
        return res.status(400).json({ 
          message: 'Tous les champs sont obligatoires' 
        });
      }

      // Vérifier si l'utilisateur existe déjà
      const utilisateurExistant = await UserModel.findUserByEmail(email);
      if (utilisateurExistant) {
        return res.status(409).json({ 
          message: 'Un compte avec cet email existe déjà' 
        });
      }

      // Créer l'utilisateur dans la base de données
      const nouvelUtilisateur = await UserModel.createUser({
        email,
        password,
        nom,
        prenom,
        telephone,
        type_utilisateur
      });

      // Créer un utilisateur Firebase
      const utilisateurFirebase = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: `${prenom} ${nom}`
      });

      // Ajouter un rôle personnalisé
      await admin.auth().setCustomUserClaims(utilisateurFirebase.uid, { 
        role: type_utilisateur 
      });

      // Réponse sécurisée
      res.status(201).json({
        message: 'Inscription réussie',
        utilisateur: {
          id: nouvelUtilisateur.id,
          email: nouvelUtilisateur.email,
          type_utilisateur: nouvelUtilisateur.type_utilisateur
        }
      });

    } catch (error) {
      winston.error('Erreur lors de l\'inscription', error);
      res.status(500).json({ 
        message: 'Erreur lors de l\'inscription' 
      });
    }
  }

  static async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      // Authentification
      const utilisateur = await UserModel.authenticateUser(email, password);

      if (!utilisateur) {
        return res.status(401).json({ 
          message: 'Email ou mot de passe incorrect' 
        });
      }

      // Générer un token Firebase
      const token = await admin.auth().createCustomToken(utilisateur.id.toString(), {
        role: utilisateur.type_utilisateur
      });

      res.status(200).json({
        message: 'Connexion réussie',
        token: token,
        utilisateur: {
          id: utilisateur.id,
          email: utilisateur.email,
          type_utilisateur: utilisateur.type_utilisateur
        }
      });

    } catch (error) {
      winston.error('Erreur de connexion', error);
      res.status(500).json({ 
        message: 'Erreur de connexion' 
      });
    }
  }

  static async getUserProfile(req, res) {
    try {
      const userId = req.user.uid;

      // Récupérer le profil utilisateur
      const profil = await UserModel.findUserById(userId);

      if (!profil) {
        return res.status(404).json({ 
          message: 'Profil utilisateur non trouvé' 
        });
      }

      res.status(200).json({ profil });
    } catch (error) {
      winston.error('Erreur de récupération du profil', error);
      res.status(500).json({ 
        message: 'Erreur de récupération du profil' 
      });
    }
  }

  static async updateUserProfile(req, res) {
    try {
      const userId = req.user.uid;
      const { nom, prenom, telephone } = req.body;

      const profilMisAJour = await UserModel.updateProfile(userId, {
        nom,
        prenom,
        telephone
      });

      res.status(200).json({
        message: 'Profil mis à jour avec succès',
        profil: profilMisAJour
      });
    } catch (error) {
      winston.error('Erreur de mise à jour du profil', error);
      res.status(500).json({ 
        message: 'Erreur de mise à jour du profil' 
      });
    }
  }
}

module.exports = UserController;
