import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba (Healthcheck)
app.get('/api/health', (req, res) => {
  res.json({ message: 'Conexión exitosa con el backend en Express' });
});

// Ruta de prueba simulando datos
app.get('/api/items', (req, res) => {
  res.json([
    { id: 1, title: 'Aprender Node.js y Express' },
    { id: 2, title: 'Conectar React Vite con la API' },
    { id: 3, title: 'Integrar base de datos PostgreSQL' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});