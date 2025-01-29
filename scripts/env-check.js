#!/usr/bin/env node
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { logger } = require('../src/utils/errorHandler');

class EnvValidator {
    static requiredEnvVars = [
        // Authentification
        'JWT_SECRET',
        
        // Base de données
        'DATABASE_URL',
        
        // Firebase
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
        
        // Sécurité
        'NODE_ENV',
        
        // Paiements
        'WAVE_API_KEY',
        'WAVE_MERCHANT_ID'
    ];

    static validateEnvFile() {
        const envPath = path.resolve(process.cwd(), '.env');
        const exampleEnvPath = path.resolve(process.cwd(), '.env.example');

        try {
            // Vérifier l'existence du fichier .env
            if (!fs.existsSync(envPath)) {
                logger.warn('Fichier .env manquant. Veuillez le créer en vous basant sur .env.example');
                return false;
            }

            const envContent = fs.readFileSync(envPath, 'utf8');
            const missingVars = this.requiredEnvVars.filter(varName => 
                !envContent.includes(`${varName}=`)
            );

            if (missingVars.length > 0) {
                logger.error(`Variables d'environnement manquantes : ${missingVars.join(', ')}`);
                return false;
            }

            return true;
        } catch (error) {
            logger.error('Erreur lors de la validation du fichier .env', error);
            return false;
        }
    }

    static validateEnvValues() {
        const errors = [];

        // Validation JWT_SECRET
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
            errors.push('JWT_SECRET doit faire au moins 32 caractères');
        }

        // Validation DATABASE_URL
        if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgresql://')) {
            errors.push('DATABASE_URL invalide');
        }

        // Validation Firebase
        if (!process.env.FIREBASE_PRIVATE_KEY) {
            errors.push('FIREBASE_PRIVATE_KEY manquante');
        }

        // Validation Wave
        if (!process.env.WAVE_API_KEY) {
            errors.push('WAVE_API_KEY manquante');
        }

        if (errors.length > 0) {
            errors.forEach(error => logger.error(error));
            return false;
        }

        return true;
    }

    static run() {
        logger.info('🔍 Démarrage de la validation des variables d\'environnement');

        const fileCheck = this.validateEnvFile();
        const valueCheck = this.validateEnvValues();

        if (fileCheck && valueCheck) {
            logger.info('✅ Toutes les variables d\'environnement sont correctement configurées');
            return true;
        } else {
            logger.error('❌ Problèmes de configuration détectés');
            return false;
        }
    }
}

// Exécution du script
if (require.main === module) {
    const result = EnvValidator.run();
    process.exit(result ? 0 : 1);
}

module.exports = EnvValidator;
