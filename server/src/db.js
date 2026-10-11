import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Debes configurar DATABASE_URL en server/.env');
}

export const pool = new Pool({ connectionString });

pool.on('error', (error) => {
  console.error('Error inesperado en el pool de PostgreSQL:', error);
});
