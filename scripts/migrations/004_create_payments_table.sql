-- Migration pour créer la table des paiements

CREATE TYPE statut_paiement_enum AS ENUM (
    'en_attente', 
    'confirme', 
    'echoue', 
    'rembourse'
);

CREATE TABLE paiements (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations(id),
    reference_paystack VARCHAR(255) UNIQUE NOT NULL,
    montant DECIMAL(10, 2) NOT NULL,
    statut statut_paiement_enum DEFAULT 'en_attente',
    email_client VARCHAR(255) NOT NULL,
    date_paiement TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_paiements_reservation ON paiements(reservation_id);
CREATE INDEX idx_paiements_reference ON paiements(reference_paystack);
CREATE INDEX idx_paiements_statut ON paiements(statut);
