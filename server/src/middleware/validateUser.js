export function validarUsuario(req, res, next) {
  const datos = req.body || {};
  const name = typeof datos.name === 'string' ? datos.name.trim() : '';
  const lastName = typeof datos.lastName === 'string' ? datos.lastName.trim() : '';
  const email = typeof datos.email === 'string' ? datos.email.trim() : '';
  const soloLetras = /^[\p{L} ]+$/u;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name) {
    return res.status(400).json({
      message: 'El campo nombre no puede ir vacío',
    });
  }

  if (name.length < 2 || name.length > 50 || !soloLetras.test(name)) {
    return res.status(400).json({
      message: 'El nombre debe tener entre 2 y 50 caracteres y solo puede contener letras y espacios.',
    });
  }

  if (!lastName) {
    return res.status(400).json({
      message: 'El campo apellido no puede ir vacío',
    });
  }

  if (lastName.length < 2 || lastName.length > 50 || !soloLetras.test(lastName)) {
    return res.status(400).json({
      message: 'El apellido debe tener entre 2 y 50 caracteres y solo puede contener letras y espacios.',
    });
  }

  if (!email) {
    return res.status(400).json({
      message: 'El campo correo electrónico no puede ir vacío',
    });
  }

  if (email.length > 100 || !emailValido.test(email)) {
    return res.status(400).json({
      message: 'Ingresa un correo electrónico válido de máximo 100 caracteres.',
    });
  }

  req.body = { name, lastName, email };
  next();
}
