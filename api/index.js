module.exports = (req, res) => {
    console.log(`Requête reçue : ${req.method} ${req.url}`);
    
    // Logs de débogage
    console.log('Headers reçus :', req.headers);

    // Configuration des headers CORS les plus permissifs
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Gestion des requêtes OPTIONS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Routes principales avec logs
    switch (req.url) {
        case '/health':
            console.log('Route /health atteinte');
            res.status(200).json({ 
                status: 'OK', 
                message: 'Séréko API est en ligne',
                timestamp: new Date().toISOString()
            });
            break;
        case '/':
        case '':
            console.log('Route racine atteinte');
            res.status(200).json({ 
                message: 'Bienvenue sur Séréko API',
                version: '1.0.0'
            });
            break;
        default:
            console.log(`Route non trouvée : ${req.url}`);
            res.status(404).json({ 
                error: 'Route non trouvée', 
                path: req.url 
            });
    }
};
