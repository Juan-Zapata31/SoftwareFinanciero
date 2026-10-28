import { randomBytes } from 'node:crypto';

const sesiones = new Map();
const duracionSesion = 8 * 60 * 60 * 1000;

export function crearSesion(username) {
  const token = randomBytes(32).toString('hex');
  sesiones.set(token, {
    username,
    expiraEn: Date.now() + duracionSesion,
  });
  return token;
}

export function obtenerSesion(token) {
  const sesion = sesiones.get(token);
  if (!sesion) return null;

  if (sesion.expiraEn <= Date.now()) {
    sesiones.delete(token);
    return null;
  }

  return sesion;
}

export function eliminarSesion(token) {
  sesiones.delete(token);
}
