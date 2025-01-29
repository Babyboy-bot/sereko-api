const admin = require('firebase-admin');
const { logger } = require('../utils/errorHandler');

class FirebaseService {
    constructor() {
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) {
            return admin;
        }

        try {
            // Vérification des variables d'environnement
            if (!process.env.FIREBASE_PROJECT_ID || 
                !process.env.FIREBASE_PRIVATE_KEY || 
                !process.env.FIREBASE_CLIENT_EMAIL) {
                throw new Error('Configuration Firebase incomplète');
            }

            // Configuration Firebase
            const firebaseConfig = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL
            };

            admin.initializeApp({
                credential: admin.credential.cert(firebaseConfig),
                // Ajoutez d'autres configurations si nécessaire
            });

            this.initialized = true;
            logger.info('✅ Firebase initialisé avec succès');
            return admin;
        } catch (error) {
            logger.error('❌ Erreur d\'initialisation Firebase', error);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            const userRecord = await admin.auth().createUser({
                email: userData.email,
                password: userData.password,
                displayName: `${userData.prenom} ${userData.nom}`,
                photoURL: userData.photo_profil || undefined
            });

            // Définir des claims personnalisés
            await admin.auth().setCustomUserClaims(userRecord.uid, {
                role: userData.type_utilisateur || 'client'
            });

            logger.info(`👤 Utilisateur Firebase créé : ${userRecord.uid}`);
            return userRecord;
        } catch (error) {
            logger.error('❌ Erreur de création utilisateur Firebase', error);
            throw error;
        }
    }

    async verifyIdToken(token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            return decodedToken;
        } catch (error) {
            logger.error('❌ Erreur de vérification du token', error);
            throw error;
        }
    }

    async sendPasswordResetEmail(email) {
        try {
            const link = await admin.auth().generatePasswordResetLink(email);
            // Vous pouvez ajouter ici la logique d'envoi d'email
            logger.info(`🔐 Lien de réinitialisation généré pour ${email}`);
            return link;
        } catch (error) {
            logger.error('❌ Erreur de génération de lien de réinitialisation', error);
            throw error;
        }
    }

    async deleteUser(uid) {
        try {
            await admin.auth().deleteUser(uid);
            logger.info(`🗑️ Utilisateur Firebase supprimé : ${uid}`);
            return true;
        } catch (error) {
            logger.error('❌ Erreur de suppression utilisateur Firebase', error);
            throw error;
        }
    }

    // Méthode pour obtenir un token personnalisé
    async createCustomToken(uid, additionalClaims = {}) {
        try {
            const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
            return customToken;
        } catch (error) {
            logger.error('❌ Erreur de création de token personnalisé', error);
            throw error;
        }
    }
}

// Singleton
const firebaseService = new FirebaseService();

module.exports = firebaseService;
