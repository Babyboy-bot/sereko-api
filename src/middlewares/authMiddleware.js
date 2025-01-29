const jwt = require('jsonwebtoken');
const { CustomError, ErrorTypes } = require('./errorMiddleware');
const { logger } = require('../utils/errorHandler');
const firebaseService = require('../services/firebaseService');

class AuthMiddleware {
    // Vérification du token JWT
    static async authenticateToken(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                throw new CustomError(
                    'Token d\'authentification manquant', 
                    ErrorTypes.AUTHENTICATION_ERROR, 
                    401
                );
            }

            // Vérification du token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Validation supplémentaire avec Firebase
            const firebaseUser = await firebaseService.verifyIdToken(token);

            // Fusion des informations
            req.user = {
                id: decoded.id,
                email: decoded.email,
                firebaseUid: firebaseUser.uid,
                role: decoded.role || 'client'
            };

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                next(new CustomError(
                    'Token expiré, veuillez vous reconnecter', 
                    ErrorTypes.AUTHENTICATION_ERROR, 
                    401
                ));
            } else if (error.name === 'JsonWebTokenError') {
                next(new CustomError(
                    'Token invalide', 
                    ErrorTypes.AUTHENTICATION_ERROR, 
                    401
                ));
            } else {
                next(error);
            }
        }
    }

    // Autorisation basée sur les rôles
    static authorize(roles = []) {
        return (req, res, next) => {
            // Si aucun rôle n'est spécifié, autoriser tous les utilisateurs authentifiés
            if (roles.length === 0) {
                return next();
            }

            const userRole = req.user.role;

            if (!roles.includes(userRole)) {
                throw new CustomError(
                    `Accès refusé. Rôles requis : ${roles.join(', ')}`, 
                    ErrorTypes.AUTHORIZATION_ERROR, 
                    403
                );
            }

            next();
        };
    }

    // Génération de token JWT
    static generateToken(user, expiresIn = '30d') {
        return jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.type_utilisateur 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn }
        );
    }

    // Middleware de rafraîchissement de token
    static async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                throw new CustomError(
                    'Refresh token manquant', 
                    ErrorTypes.AUTHENTICATION_ERROR, 
                    400
                );
            }

            // Logique de vérification du refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
            
            // Générer un nouveau token
            const newToken = this.generateToken(decoded);

            res.json({ 
                token: newToken,
                expiresIn: '30d'
            });
        } catch (error) {
            next(error);
        }
    }

    // Journalisation des tentatives de connexion
    static async logLoginAttempt(email, success) {
        try {
            logger.info('Tentative de connexion', {
                email,
                success,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erreur lors de la journalisation', error);
        }
    }
}

module.exports = AuthMiddleware;
