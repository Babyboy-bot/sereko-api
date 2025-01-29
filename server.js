require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const database = require('./src/config/database');

const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet.permissive());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à la base de données
database.connect();

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Séréko API est en ligne',
        environment: ENVIRONMENT,
        timestamp: new Date().toISOString()
    });
});

app.get('/health', async (req, res) => {
    try {
        // Test de connexion à la base de données
        await database.query('SELECT NOW()');
        
        res.status(200).json({ 
            status: 'OK', 
            message: 'Séréko API fonctionne correctement',
            database: 'Connectée',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR', 
            message: 'Problème de connexion à la base de données',
            error: error.message
        });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route non trouvée', 
        path: req.path 
    });
});

// Server Start
const server = app.listen(PORT, () => {
    console.log(`🚀 Séréko API démarrée sur le port ${PORT}`);
    console.log(`🌍 Environnement : ${ENVIRONMENT}`);
});

module.exports = app;
