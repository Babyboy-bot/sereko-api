-- Migration pour créer la table des réservations

CREATE TYPE statut_reservation_enum AS ENUM (
    'en_attente', 
    'confirmee', 
    'en_cours', 
    'terminee', 
    'annulee', 
    'disputee'
);

CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    service_id INTEGER NOT NULL REFERENCES services(id),
    prestataire_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    date_debut TIMESTAMP WITH TIME ZONE NOT NULL,
    date_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    nombre_heures DECIMAL(5, 2) NOT NULL,
    montant_total DECIMAL(10, 2) NOT NULL,
    statut statut_reservation_enum DEFAULT 'en_attente',
    adresse_prestation VARCHAR(255) NOT NULL,
    details_supplementaires TEXT,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_reservations_client ON reservations(client_id);
CREATE INDEX idx_reservations_service ON reservations(service_id);
CREATE INDEX idx_reservations_prestataire ON reservations(prestataire_id);
CREATE INDEX idx_reservations_statut ON reservations(statut);

-- Trigger pour mettre à jour la date de mise à jour
CREATE OR REPLACE FUNCTION update_reservation_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_mise_a_jour = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reservation_modtime
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_reservation_modified_column();
