require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { logger } = require('./src/utils/errorHandler');

// Services
const firebaseService = require('./src/services/firebaseService');
const databaseService = require('./src/services/databaseService');

// Middlewares
const errorHandler = require('./src/middlewares/errorMiddleware');
const authMiddleware = require('./src/middlewares/authMiddleware');

// Routes
const userRoutes = require('./src/routes/userRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const reservationRoutes = require('./src/routes/reservationRoutes');

const app = express();

// Configuration globale
const PORT = process.env.PORT || 3000;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Middleware de sécurité
app.use(helmet());

// Configuration CORS
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Trop de requêtes, veuillez réessayer plus tard'
});
app.use(limiter);

// Parsers
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf.toString());
        } catch (e) {
            res.status(400).json({ error: 'Invalid JSON' });
        }
    }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialisation des services
async function initializeServices() {
    try {
        await databaseService.connect();
        firebaseService.initialize();
        logger.info('✅ Services initialisés avec succès');
    } catch (error) {
        logger.error('❌ Échec de l\'initialisation des services', error);
        process.exit(1);
    }
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reservations', reservationRoutes);

// Route de test
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        environment: ENVIRONMENT,
        timestamp: new Date().toISOString()
    });
});

// Gestion des routes non trouvées
app.use((req, res, next) => {
    res.status(404).json({ 
        error: 'Route non trouvée', 
        path: req.path 
    });
});

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur
async function startServer() {
    try {
        await initializeServices();
        
        const server = app.listen(PORT, () => {
            logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
            logger.info(`🌍 Environnement : ${ENVIRONMENT}`);
        });

        // Gestion des arrêts serveur
        process.on('SIGTERM', () => {
            logger.info('🔌 Arrêt du serveur en cours...');
            server.close(() => {
                databaseService.close();
                process.exit(0);
            });
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
