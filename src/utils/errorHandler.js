const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, align } = format;

// Configuration du logger
const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        align(),
        printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [
        // Console pour le développement
        new transports.Console(),
        
        // Fichier pour les erreurs
        new transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        
        // Fichier pour tous les logs
        new transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

class ErrorHandler {
    // Gestion des erreurs génériques
    static handleError(error, req = null, res = null) {
        // Log détaillé de l'erreur
        logger.error(`
            Message: ${error.message}
            Stack: ${error.stack}
            ${req ? `Request Details:
            - Path: ${req.path}
            - Method: ${req.method}
            - Body: ${JSON.stringify(req.body)}` : ''}
        `);

        // Réponse standardisée pour l'API
        if (res) {
            const statusCode = error.status || 500;
            res.status(statusCode).json({
                success: false,
                timestamp: new Date().toISOString(),
                error: {
                    message: error.message || 'Erreur interne du serveur',
                    code: error.code || 'INTERNAL_SERVER_ERROR'
                }
            });
        }
    }

    // Middleware de gestion des erreurs pour Express
    static errorMiddleware(err, req, res, next) {
        this.handleError(err, req, res);
    }

    // Wrapper pour les routes asynchrones
    static asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

    // Validation des données d'entrée
    static validateInput(validationResult) {
        return (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array().map(err => ({
                        field: err.param,
                        message: err.msg
                    }))
                });
            }
            next();
        };
    }
}

module.exports = { ErrorHandler, logger };
