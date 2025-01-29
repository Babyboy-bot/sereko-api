const express = require('express');
const { authenticateUser, authorizeRole } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const AuthMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Validation pour la création d'utilisateur
const createUserValidation = [
    body('email').isEmail().withMessage('Email invalide'),
    body('password')
        .isLength({ min: 8 }).withMessage('Le mot de passe doit faire au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('prenom').notEmpty().withMessage('Le prénom est requis'),
    body('telephone')
        .matches(/^(0|\+225)[0-9]{10}$/)
        .withMessage('Numéro de téléphone invalide')
];

// Validation pour la mise à jour du profil
const updateProfileValidation = [
    body('nom').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('prenom').optional().notEmpty().withMessage('Le prénom ne peut pas être vide'),
    body('telephone')
        .optional()
        .matches(/^(0|\+225)[0-9]{10}$/)
        .withMessage('Numéro de téléphone invalide')
];

// Validation pour le changement de mot de passe
const changePasswordValidation = [
    body('oldPassword').notEmpty().withMessage('Ancien mot de passe requis'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('Le nouveau mot de passe doit faire au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial')
];

// Public routes
router.post('/register', createUserValidation, userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes
router.get('/profile', 
    AuthMiddleware.authenticateToken, 
    userController.getUserProfile
);

router.put('/profile', 
    AuthMiddleware.authenticateToken, 
    AuthMiddleware.authorizeRoles('client', 'prestataire'), 
    updateProfileValidation, 
    userController.updateUserProfile
);

router.post('/change-password', 
    AuthMiddleware.authenticateToken, 
    changePasswordValidation, 
    userController.changePassword
);

// Admin routes
router.get('/', 
    AuthMiddleware.authenticateToken, 
    AuthMiddleware.authorizeRoles('admin'), 
    userController.listUsers
);

router.delete('/:userId', 
    AuthMiddleware.authenticateToken, 
    AuthMiddleware.authorizeRoles('admin'), 
    userController.deleteUser
);

module.exports = router;
