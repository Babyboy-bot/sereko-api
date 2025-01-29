require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { logger } = require('./src/utils/errorHandler');

const app = express();

// Configuration globale
const PORT = process.env.PORT || 3000;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Middleware CORS ultra-permissif pour Vercel
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de sécurité minimal
app.use(helmet.permissive());

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de santé publique
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        environment: ENVIRONMENT,
        timestamp: new Date().toISOString()
    });
});

// Route de base publique
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Séréko API is running',
        environment: ENVIRONMENT
    });
});

// Gestion des routes non trouvées
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route non trouvée', 
        path: req.path 
    });
});

// Démarrage du serveur
function startServer() {
    try {
        const server = app.listen(PORT, () => {
            logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
            logger.info(`🌍 Environnement : ${ENVIRONMENT}`);
        });
    } catch (error) {
        logger.error('❌ Échec du démarrage du serveur', error);
        process.exit(1);
    }
}

// Démarrage conditionnel
if (require.main === module) {
    startServer();
}

module.exports = app;
