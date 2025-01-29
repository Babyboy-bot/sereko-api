const { logger } = require('../utils/errorHandler');

class ErrorTypes {
    static VALIDATION_ERROR = 'ValidationError';
    static AUTHENTICATION_ERROR = 'AuthenticationError';
    static AUTHORIZATION_ERROR = 'AuthorizationError';
    static NOT_FOUND_ERROR = 'NotFoundError';
    static DATABASE_ERROR = 'DatabaseError';
    static EXTERNAL_SERVICE_ERROR = 'ExternalServiceError';
}

class CustomError extends Error {
    constructor(message, type = 'GenericError', statusCode = 500) {
        super(message);
        this.name = type;
        this.statusCode = statusCode;
    }
}

function errorMiddleware(err, req, res, next) {
    // Log détaillé de l'erreur
    logger.error('Erreur middleware', {
        message: err.message,
        type: err.name || 'UnknownError',
        path: req.path,
        method: req.method,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    });

    // Gestion des erreurs spécifiques
    const errorHandlers = {
        [ErrorTypes.VALIDATION_ERROR]: () => ({
            statusCode: 400,
            message: err.message || 'Erreur de validation des données'
        }),
        [ErrorTypes.AUTHENTICATION_ERROR]: () => ({
            statusCode: 401,
            message: err.message || 'Authentification requise'
        }),
        [ErrorTypes.AUTHORIZATION_ERROR]: () => ({
            statusCode: 403,
            message: err.message || 'Accès non autorisé'
        }),
        [ErrorTypes.NOT_FOUND_ERROR]: () => ({
            statusCode: 404,
            message: err.message || 'Ressource non trouvée'
        }),
        [ErrorTypes.DATABASE_ERROR]: () => ({
            statusCode: 500,
            message: 'Erreur de base de données'
        }),
        [ErrorTypes.EXTERNAL_SERVICE_ERROR]: () => ({
            statusCode: 502,
            message: 'Erreur de service externe'
        })
    };

    // Sélection du gestionnaire d'erreur
    const handler = errorHandlers[err.name] || (() => ({
        statusCode: err.statusCode || 500,
        message: err.message || 'Erreur interne du serveur'
    }));

    const { statusCode, message } = handler();

    // Réponse standardisée
    res.status(statusCode).json({
        success: false,
        error: {
            type: err.name || 'UnknownError',
            message: message,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        }
    });
}

module.exports = {
    errorMiddleware,
    CustomError,
    ErrorTypes
};
