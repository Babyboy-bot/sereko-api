const { executeQuery } = require('../utils/database');
const bcrypt = require('bcryptjs');

class UserModel {
    static async createUser(userData) {
        const { 
            email, 
            password, 
            nom, 
            prenom, 
            telephone, 
            type_utilisateur = 'client',
            adresse = null,
            photo_profil = null
        } = userData;

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO utilisateurs 
            (email, mot_de_passe, nom, prenom, telephone, type_utilisateur, adresse, photo_profil, date_inscription, derniere_connexion)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING id, email, nom, prenom, type_utilisateur
        `;

        const values = [
            email, 
            hashedPassword, 
            nom, 
            prenom, 
            telephone, 
            type_utilisateur,
            adresse,
            photo_profil
        ];

        try {
            const result = await executeQuery(query, values);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Cet email est déjà utilisé');
            }
            throw error;
        }
    }

    static async updateProfile(userId, updateData) {
        const { 
            nom, 
            prenom, 
            telephone, 
            adresse, 
            photo_profil 
        } = updateData;

        const query = `
            UPDATE utilisateurs 
            SET 
                nom = COALESCE($1, nom),
                prenom = COALESCE($2, prenom),
                telephone = COALESCE($3, telephone),
                adresse = COALESCE($4, adresse),
                photo_profil = COALESCE($5, photo_profil),
                derniere_modification = NOW()
            WHERE id = $6
            RETURNING id, email, nom, prenom, telephone, adresse, photo_profil
        `;

        const values = [
            nom, 
            prenom, 
            telephone, 
            adresse, 
            photo_profil, 
            userId
        ];

        try {
            const result = await executeQuery(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getUserProfile(userId) {
        const query = `
            SELECT 
                id, 
                email, 
                nom, 
                prenom, 
                telephone, 
                type_utilisateur, 
                adresse, 
                photo_profil,
                date_inscription,
                derniere_connexion
            FROM utilisateurs 
            WHERE id = $1
        `;

        try {
            const result = await executeQuery(query, [userId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async changePassword(userId, oldPassword, newPassword) {
        // Récupérer le mot de passe actuel
        const checkQuery = 'SELECT mot_de_passe FROM utilisateurs WHERE id = $1';
        const checkResult = await executeQuery(checkQuery, [userId]);
        
        if (checkResult.rows.length === 0) {
            throw new Error('Utilisateur non trouvé');
        }

        const currentHashedPassword = checkResult.rows[0].mot_de_passe;
        
        // Vérifier l'ancien mot de passe
        const isPasswordValid = await bcrypt.compare(oldPassword, currentHashedPassword);
        
        if (!isPasswordValid) {
            throw new Error('Ancien mot de passe incorrect');
        }

        // Hacher le nouveau mot de passe
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe
        const updateQuery = `
            UPDATE utilisateurs 
            SET mot_de_passe = $1, 
                derniere_modification = NOW() 
            WHERE id = $2
        `;

        await executeQuery(updateQuery, [newHashedPassword, userId]);
        return true;
    }
}

module.exports = UserModel;
