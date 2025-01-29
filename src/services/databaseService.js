const { Pool } = require('pg');
const winston = require('winston');

let pool;

function createDatabasePool() {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  pool.on('error', (err) => {
    winston.error('Unexpected database error', err);
  });

  return pool;
}

async function connectDatabase() {
  try {
    const client = await pool.connect();
    winston.info('Successfully connected to PostgreSQL database');
    client.release();
  } catch (error) {
    winston.error('Database connection error', error);
    throw error;
  }
}

async function executeQuery(query, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}

module.exports = {
  createDatabasePool,
  connectDatabase,
  executeQuery
};
