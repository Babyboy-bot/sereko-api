-- Migration pour créer la table des notifications

CREATE TYPE type_notification_enum AS ENUM (
    'reservation', 
    'paiement', 
    'service', 
    'compte', 
    'autre'
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    type type_notification_enum NOT NULL,
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_entite VARCHAR(255),
    est_lu BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Modification de la table utilisateurs pour ajouter le token FCM
ALTER TABLE utilisateurs 
ADD COLUMN fcm_token VARCHAR(255);

-- Index pour améliorer les performances
CREATE INDEX idx_notifications_utilisateur ON notifications(utilisateur_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_est_lu ON notifications(est_lu);
