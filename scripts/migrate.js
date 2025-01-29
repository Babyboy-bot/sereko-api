const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Configuration du logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'migration.log' })
  ]
});

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Créer la table des migrations si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        run_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Chemin vers les fichiers de migration
    const migrationDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Trier pour assurer l'ordre correct

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationDir, file);
      
      // Vérifier si la migration a déjà été exécutée
      const { rows } = await pool.query(
        'SELECT * FROM migrations WHERE name = $1', 
        [file]
      );

      if (rows.length === 0) {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        logger.info(`Exécution de la migration : ${file}`);
        
        // Exécuter la migration
        await pool.query(migrationSQL);
        
        // Enregistrer la migration comme exécutée
        await pool.query(
          'INSERT INTO migrations (name) VALUES ($1)', 
          [file]
        );
        
        logger.info(`Migration ${file} terminée avec succès`);
      } else {
        logger.info(`Migration ${file} déjà exécutée`);
      }
    }

    logger.info('Toutes les migrations ont été exécutées avec succès');
  } catch (error) {
    logger.error('Erreur lors des migrations', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
