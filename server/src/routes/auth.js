import { timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { crearSesion, eliminarSesion } from '../authSessions.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

function compararCredencial(proporcionada, esperada) {
  const valorProporcionado = Buffer.from(proporcionada);
  const valorEsperado = Buffer.from(esperada);

  return (
    valorProporcionado.length === valorEsperado.length &&
    timingSafeEqual(valorProporcionado, valorEsperado)
  );
}

router.post('/login', (req, res) => {
  const usuarioConfigurado = process.env.ADMIN_USERNAME;
  const claveConfigurada = process.env.ADMIN_PASSWORD;

  if (!usuarioConfigurado || !claveConfigurada) {
    console.error('Faltan ADMIN_USERNAME o ADMIN_PASSWORD en la configuración del servidor.');
    return res.status(503).json({
      message: 'El inicio de sesión no está configurado en el servidor.',
    });
  }

  const { username, password } = req.body ?? {};
  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !compararCredencial(username, usuarioConfigurado) ||
    !compararCredencial(password, claveConfigurada)
  ) {
    return res.status(401).json({ message: 'Usuario o clave incorrectos.' });
  }

  const token = crearSesion(usuarioConfigurado);
  return res.status(200).json({
    token,
    user: { username: usuarioConfigurado },
  });
});

router.post('/logout', requireAuth, (req, res) => {
  eliminarSesion(req.authToken);
  return res.status(204).end();
});

export default router;
