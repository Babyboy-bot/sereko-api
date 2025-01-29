# Séréko - Service Marketplace Platform

## Project Overview

Séréko is a SaaS platform designed to connect individuals with service providers in Côte d'Ivoire, offering a comprehensive solution for finding and booking professional services.

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL (Supabase)
- **Frontend**: React (Next.js)
- **Authentication**: Firebase Auth
- **File Storage**: Cloudinary
- **Payments**: Paystack
- **Deployment**: Vercel (Frontend), Railway (Backend)

## Key Features

- User and Provider Registration
- Advanced Service Search
- Booking and Scheduling
- Real-time Notifications
- Secure Online Payments
- Review and Rating System

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- Supabase Account
- Paystack Account
- Cloudinary Account
- Firebase Account

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations
5. Start the development server

## Déploiement

### Prérequis
- Node.js (v16+)
- Docker (optionnel)
- Compte Supabase
- Compte Firebase
- Compte Paystack

### Configuration de l'environnement
1. Copiez `.env.example` vers `.env`
2. Remplissez les variables d'environnement

### Installation locale
```bash
npm install
npm run migrate  # Exécuter les migrations de base de données
npm run dev      # Démarrer en mode développement
```

### Déploiement Docker
```bash
docker build -t sereko-api .
docker run -p 3000:3000 sereko-api
```

### Déploiement sur Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/YOUR_TEMPLATE_ID)

## Déploiement sur Railway

### Prérequis
- Compte GitHub
- Compte Railway
- Compte Firebase
- Compte Paystack

### Étapes de Déploiement

1. **Connexion à Railway**
   - Créez un compte sur [Railway](https://railway.app/)
   - Connectez votre compte GitHub

2. **Configuration du Projet**
   - Créez un nouveau projet Railway
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez votre dépôt Séréko

3. **Services Requis**
   - Ajoutez un service PostgreSQL
   - Copiez l'URL de connexion générée

4. **Variables d'Environnement**
   Configurez les variables suivantes dans Railway :
   ```
   DATABASE_URL = postgresql://...
   FIREBASE_PROJECT_ID = votre_id_projet
   FIREBASE_PRIVATE_KEY = votre_clé_privée
   FIREBASE_CLIENT_EMAIL = votre_email_client
   PAYSTACK_SECRET_KEY = votre_clé_secrète_paystack
   PAYSTACK_PUBLIC_KEY = votre_clé_publique_paystack
   EMAIL_HOST = smtp.gmail.com
   EMAIL_PORT = 587
   EMAIL_USER = votre_email
   EMAIL_PASS = votre_mot_de_passe_app
   JWT_SECRET = générez_une_longue_chaîne_aléatoire
   NODE_ENV = production
   ```

5. **Déploiement**
   - Railway détectera automatiquement le `railway.toml`
   - Construction et déploiement automatiques

### Commandes Utiles

```bash
# Installation des dépendances
npm install

# Exécuter les migrations
npm run migrate

# Démarrer le serveur en développement
npm run dev

# Lancer les tests
npm test
```

### Sécurité
- Gardez vos clés secrètes privées
- Utilisez des variables d'environnement
- Activez 2FA sur Railway

### Monitoring
- Endpoint de santé : `/api/health`
- Vérifiez les logs dans Railway

## Tests
```bash
npm test         # Exécuter tous les tests
npm run lint     # Vérifier la qualité du code
```

## Monetization Model

- 10-15% commission on transactions
- Premium provider subscriptions
- Targeted advertising
- Late cancellation fees

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
