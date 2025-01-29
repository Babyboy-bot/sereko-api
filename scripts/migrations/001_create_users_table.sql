-- Migration pour créer la table des utilisateurs

CREATE TYPE type_utilisateur_enum AS ENUM ('client', 'prestataire', 'admin');

CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    type_utilisateur type_utilisateur_enum NOT NULL,
    est_actif BOOLEAN DEFAULT TRUE,
    date_inscription TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX idx_utilisateurs_type ON utilisateurs(type_utilisateur);
