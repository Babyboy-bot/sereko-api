const { executeQuery } = require('../services/databaseService');
const bcrypt = require('bcryptjs');
const winston = require('winston');

class UserModel {
  static async createUser(userData) {
    const { 
      email, 
      password, 
      nom, 
      prenom, 
      telephone, 
      type_utilisateur 
    } = userData;

    try {
      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const motDePasseHache = await bcrypt.hash(password, salt);

      const query = `
        INSERT INTO utilisateurs 
        (email, mot_de_passe, nom, prenom, telephone, type_utilisateur, date_inscription) 
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
        RETURNING id, email, type_utilisateur
      `;

      const values = [
        email, 
        motDePasseHache, 
        nom, 
        prenom, 
        telephone, 
        type_utilisateur
      ];

      const result = await executeQuery(query, values);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur lors de la création de l\'utilisateur', error);
      throw new Error('Impossible de créer l\'utilisateur');
    }
  }

  static async findUserByEmail(email) {
    try {
      const query = 'SELECT * FROM utilisateurs WHERE email = $1';
      const result = await executeQuery(query, [email]);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur lors de la recherche de l\'utilisateur', error);
      throw new Error('Erreur de recherche utilisateur');
    }
  }

  static async authenticateUser(email, password) {
    try {
      const user = await this.findUserByEmail(email);
      
      if (!user) {
        return null;
      }

      const motDePasseValide = await bcrypt.compare(password, user.mot_de_passe);
      
      if (!motDePasseValide) {
        return null;
      }

      // Supprimer le mot de passe avant de retourner l'utilisateur
      const { mot_de_passe, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      winston.error('Erreur d\'authentification', error);
      throw new Error('Erreur d\'authentification');
    }
  }

  static async updateProfile(userId, profileData) {
    const { nom, prenom, telephone } = profileData;

    try {
      const query = `
        UPDATE utilisateurs 
        SET nom = $1, prenom = $2, telephone = $3 
        WHERE id = $4 
        RETURNING id, email, nom, prenom, telephone
      `;

      const result = await executeQuery(query, [nom, prenom, telephone, userId]);
      return result.rows[0];
    } catch (error) {
      winston.error('Erreur de mise à jour du profil', error);
      throw new Error('Impossible de mettre à jour le profil');
    }
  }
}

module.exports = UserModel;
