import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import usersRouter from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);

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

app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});