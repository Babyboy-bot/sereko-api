const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

class UserController {
    static async createUser(req, res) {
        try {
            // Validation des données d'entrée
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const userData = req.body;
            const newUser = await UserModel.createUser(userData);
            
            // Générer un token JWT
            const token = jwt.sign(
                { id: newUser.id, email: newUser.email }, 
                process.env.JWT_SECRET, 
                { expiresIn: '30d' }
            );

            res.status(201).json({
                message: 'Utilisateur créé avec succès',
                user: newUser,
                token
            });
        } catch (error) {
            console.error('Erreur de création utilisateur :', error);
            res.status(500).json({ 
                message: error.message || 'Erreur lors de la création de l\'utilisateur' 
            });
        }
    }

    static async updateProfile(req, res) {
        try {
            const userId = req.user.id; // Récupéré du middleware d'authentification
            const updateData = req.body;

            const updatedUser = await UserModel.updateProfile(userId, updateData);

            res.status(200).json({
                message: 'Profil mis à jour avec succès',
                user: updatedUser
            });
        } catch (error) {
            console.error('Erreur de mise à jour du profil :', error);
            res.status(500).json({ 
                message: error.message || 'Erreur lors de la mise à jour du profil' 
            });
        }
    }

    static async getUserProfile(req, res) {
        try {
            const userId = req.user.id; // Récupéré du middleware d'authentification

            const userProfile = await UserModel.getUserProfile(userId);

            if (!userProfile) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            res.status(200).json(userProfile);
        } catch (error) {
            console.error('Erreur de récupération du profil :', error);
            res.status(500).json({ 
                message: error.message || 'Erreur lors de la récupération du profil' 
            });
        }
    }

    static async changePassword(req, res) {
        try {
            const userId = req.user.id; // Récupéré du middleware d'authentification
            const { oldPassword, newPassword } = req.body;

            await UserModel.changePassword(userId, oldPassword, newPassword);

            res.status(200).json({
                message: 'Mot de passe modifié avec succès'
            });
        } catch (error) {
            console.error('Erreur de changement de mot de passe :', error);
            res.status(500).json({ 
                message: error.message || 'Erreur lors du changement de mot de passe' 
            });
        }
    }
}

module.exports = UserController;
