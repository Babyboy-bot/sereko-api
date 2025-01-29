const { Pool } = require('pg');

const dbConfig = {
    host: process.env.RAILWAY_PRIVATE_DOMAIN,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20 // maximum number of clients in the pool
};

const pool = new Pool(dbConfig);

// Gestion des erreurs de connexion
pool.on('error', (err) => {
    console.error('Erreur inattendue dans le pool de connexions', err);
});

module.exports = {
    connect: async () => {
        try {
            const client = await pool.connect();
            console.log('✅ Connexion à la base de données établie');
            client.release();
        } catch (err) {
            console.error('❌ Impossible de se connecter à la base de données', err);
            process.exit(1);
        }
    },
    query: (text, params) => pool.query(text, params),
    pool
};
