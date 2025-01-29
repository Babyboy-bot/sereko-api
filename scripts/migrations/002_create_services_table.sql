-- Migration pour créer la table des services

CREATE TYPE categorie_service_enum AS ENUM (
    'bricolage', 
    'jardinage', 
    'menage', 
    'informatique', 
    'cours_particuliers', 
    'demenagement', 
    'garde_enfants', 
    'assistance_administrative', 
    'autres'
);

CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    prestataire_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    categorie categorie_service_enum NOT NULL,
    tarif_horaire DECIMAL(10, 2) NOT NULL,
    localisation VARCHAR(255) NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_services_prestataire ON services(prestataire_id);
CREATE INDEX idx_services_categorie ON services(categorie);
CREATE INDEX idx_services_localisation ON services(localisation);

-- Trigger pour mettre à jour la date de mise à jour
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_mise_a_jour = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_modtime
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
