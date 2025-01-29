module.exports = (req, res) => {
    // Configuration des headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Gestion des requêtes OPTIONS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Routes principales
    switch (req.url) {
        case '/health':
            res.status(200).json({ 
                status: 'OK', 
                message: 'Séréko API est en ligne',
                timestamp: new Date().toISOString()
            });
            break;
        case '/':
        case '':
            res.status(200).json({ 
                message: 'Bienvenue sur Séréko API',
                version: '1.0.0'
            });
            break;
        default:
            res.status(404).json({ 
                error: 'Route non trouvée', 
                path: req.url 
            });
    }
};
