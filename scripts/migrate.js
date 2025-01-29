const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { logger } = require('../src/utils/errorHandler');

class DatabaseMigration {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    }

    async connect() {
        try {
            await this.pool.connect();
            logger.info(' Connexion à la base de données réussie');
            return this.pool;
        } catch (error) {
            logger.error(' Échec de connexion à la base de données', error);
            throw error;
        }
    }

    async createTablesIfNotExist() {
        const client = await this.pool.connect();
        
        try {
            // Utilisateurs
            await client.query(`
                CREATE TABLE IF NOT EXISTS utilisateurs (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    mot_de_passe VARCHAR(255) NOT NULL,
                    nom VARCHAR(100) NOT NULL,
                    prenom VARCHAR(100) NOT NULL,
                    telephone VARCHAR(20) UNIQUE NOT NULL,
                    type_utilisateur VARCHAR(50) NOT NULL DEFAULT 'client',
                    adresse TEXT,
                    photo_profil VARCHAR(255),
                    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    derniere_connexion TIMESTAMP,
                    derniere_modification TIMESTAMP,
                    est_actif BOOLEAN DEFAULT TRUE,
                    verification_email BOOLEAN DEFAULT FALSE
                )
            `);

            // Services
            await client.query(`
                CREATE TABLE IF NOT EXISTS services (
                    id SERIAL PRIMARY KEY,
                    titre VARCHAR(255) NOT NULL,
                    description TEXT,
                    categorie VARCHAR(100),
                    prix DECIMAL(10,2) NOT NULL,
                    prestataire_id INTEGER REFERENCES utilisateurs(id),
                    disponible BOOLEAN DEFAULT TRUE,
                    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    date_modification TIMESTAMP
                )
            `);

            // Réservations
            await client.query(`
                CREATE TABLE IF NOT EXISTS reservations (
                    id SERIAL PRIMARY KEY,
                    service_id INTEGER REFERENCES services(id),
                    client_id INTEGER REFERENCES utilisateurs(id),
                    date_reservation TIMESTAMP NOT NULL,
                    statut VARCHAR(50) DEFAULT 'en_attente',
                    montant DECIMAL(10,2) NOT NULL,
                    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Paiements
            await client.query(`
                CREATE TABLE IF NOT EXISTS paiements (
                    id SERIAL PRIMARY KEY,
                    reservation_id INTEGER REFERENCES reservations(id),
                    montant DECIMAL(10,2) NOT NULL,
                    methode VARCHAR(50) NOT NULL,
                    statut VARCHAR(50) DEFAULT 'en_cours',
                    transaction_id VARCHAR(255),
                    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            logger.info(' Tables créées avec succès');
        } catch (error) {
            logger.error(' Erreur lors de la création des tables', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async runMigration() {
        try {
            await this.connect();
            await this.createTablesIfNotExist();
        } catch (error) {
            logger.error(' Migration de la base de données échouée', error);
            process.exit(1);
        } finally {
            await this.pool.end();
        }
    }
}

// Exécution du script
async function main() {
    logger.info(' Démarrage de la migration de la base de données');
    const migration = new DatabaseMigration();
    await migration.runMigration();
    logger.info(' Migration terminée avec succès');
}

if (require.main === module) {
    require('dotenv').config();
    main();
}

module.exports = DatabaseMigration;
