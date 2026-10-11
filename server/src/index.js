import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

app.post('/api/users', async (req, res) => {
  const { name, lastName, email } = req.body ?? {};

  if (
    typeof name !== 'string' ||
    typeof lastName !== 'string' ||
    typeof email !== 'string' ||
    !name.trim() ||
    !lastName.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    name.trim().length > 50 ||
    lastName.trim().length > 50 ||
    email.trim().length > 100
  ) {
    return res.status(400).json({
      message: 'Ingresa nombre, apellido y un correo válido dentro de los límites permitidos.',
    });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, "lastName", email) VALUES ($1, $2, $3) RETURNING id, name, "lastName", email',
      [name.trim(), lastName.trim(), email.trim()]
    );
    res.status(201).json({ message: 'Usuario guardado correctamente', user: rows[0] });
  } catch (error) {
    console.error('Error al guardar el usuario en PostgreSQL:', error);
    res.status(500).json({ message: 'No fue posible guardar los datos en la base de datos.' });
  }
});

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