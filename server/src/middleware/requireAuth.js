import { obtenerSesion } from '../authSessions.js';

export function requireAuth(req, res, next) {
  const authorization = req.get('authorization') ?? '';
  const coincidencia = authorization.match(/^Bearer ([\da-f]+)$/i);
  const token = coincidencia?.[1];
  const sesion = token ? obtenerSesion(token) : null;

  if (!sesion) {
    return res.status(401).json({ message: 'Debes iniciar sesión para continuar.' });
  }

  req.authToken = token;
  req.user = { username: sesion.username };
  return next();
}
