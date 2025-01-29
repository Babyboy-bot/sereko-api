const { Pool } = require('pg');
const { logger } = require('../utils/errorHandler');

class DatabaseService {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async connect() {
        if (this.isConnected) {
            return this.pool;
        }

        try {
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' 
                    ? { rejectUnauthorized: false } 
                    : false,
                max: 20,  // Maximum de connexions simultanées
                idleTimeoutMillis: 30000,  // Délai d'inactivité
                connectionTimeoutMillis: 5000  // Délai de connexion
            });

            // Test de connexion
            const client = await this.pool.connect();
            client.release();

            this.isConnected = true;
            logger.info(' Connexion à la base de données établie');
            
            return this.pool;
        } catch (error) {
            logger.error(' Échec de connexion à la base de données', error);
            throw new Error(`Connexion à la base de données impossible : ${error.message}`);
        }
    }

    async query(text, params = []) {
        if (!this.isConnected) {
            await this.connect();
        }

        try {
            return await this.pool.query(text, params);
        } catch (error) {
            logger.error(' Erreur lors de l\'exécution de la requête', {
                query: text,
                params,
                error: error.message
            });
            throw error;
        }
    }

    async transaction(queries) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            const results = [];
            for (const { text, params } of queries) {
                const result = await client.query(text, params);
                results.push(result);
            }

            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error(' Erreur de transaction', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            logger.info(' Connexion à la base de données fermée');
        }
    }

    // Méthode utilitaire pour les requêtes préparées sécurisées
    prepareQuery(query, values) {
        return {
            text: query,
            values: values
        };
    }
}

// Singleton
const databaseService = new DatabaseService();

module.exports = databaseService;
