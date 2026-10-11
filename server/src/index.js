import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba (Healthcheck)
app.get('/api/health', (req, res) => {
  res.json({ message: 'Conexión exitosa con el backend en Express' });
});

app.get('/api/health/db', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT current_database() AS database, inet_server_port() AS port'
    );
    res.json({
      message: 'Conexión exitosa con PostgreSQL',
      database: rows[0].database,
      port: rows[0].port,
    });
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:', error);
    res.status(503).json({ message: 'No fue posible conectar con PostgreSQL' });
  }
});

/*
app.get('/api/items', (req, res) => {
  res.json([
    { id: 1, title: 'Aprender Node.js y Express' },
    { id: 2, title: 'Conectar React Vite con la API' },
    { id: 3, title: 'Integrar base de datos PostgreSQL' }
  ]);
});
*/

app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});