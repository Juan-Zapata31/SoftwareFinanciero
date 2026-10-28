const metodosPago = new Set(['transferencia', 'efectivo', 'tarjeta']);
const fechaIso = /^\d{4}-\d{2}-\d{2}$/;
const valorMonetario = /^\d{1,12}(?:\.\d{1,2})?$/;

export function validarIdIngreso(req, res, next) {
  if (!/^[1-9]\d*$/.test(req.params.id)) {
    return res.status(400).json({ message: 'El identificador del ingreso no es válido.' });
  }

  return next();
}

export function validarIngreso(req, res, next) {
  const datos = req.body ?? {};
  const usuarioId =
    typeof datos.usuarioId === 'string' && /^[1-9]\d*$/.test(datos.usuarioId)
      ? datos.usuarioId
      : '';
  let cuentaBancaria =
    typeof datos.cuentaBancaria === 'string' ? datos.cuentaBancaria.trim() : '';
  const metodoPago = typeof datos.metodoPago === 'string' ? datos.metodoPago : '';
  const fechaPago = typeof datos.fechaPago === 'string' ? datos.fechaPago : '';
  const valor = typeof datos.valor === 'string' ? datos.valor.trim() : '';
  const observacion =
    typeof datos.observacion === 'string' ? datos.observacion.trim() : '';
  const fechaValida =
    fechaIso.test(fechaPago) &&
    !Number.isNaN(Date.parse(`${fechaPago}T00:00:00Z`)) &&
    new Date(`${fechaPago}T00:00:00Z`).toISOString().slice(0, 10) === fechaPago;

  if (!usuarioId) {
    return res.status(400).json({ message: 'Selecciona un usuario válido como cliente.' });
  }

  if (!metodosPago.has(metodoPago)) {
    return res.status(400).json({ message: 'Selecciona un método de pago válido.' });
  }

  if (metodoPago === 'transferencia') {
    if (!cuentaBancaria || cuentaBancaria.length > 100) {
      return res.status(400).json({
        message: 'La cuenta bancaria es obligatoria y no puede superar 100 caracteres.',
      });
    }
  } else {
    cuentaBancaria = 'No aplica';
  }

  if (!fechaValida) {
    return res.status(400).json({ message: 'Ingresa una fecha de pago válida.' });
  }

  if (!valorMonetario.test(valor) || Number(valor) <= 0) {
    return res.status(400).json({
      message: 'El valor debe ser mayor que cero y tener máximo dos decimales.',
    });
  }

  if (observacion.length > 10000) {
    return res.status(400).json({
      message: 'La observación no puede superar 10000 caracteres.',
    });
  }

  req.body = { usuarioId, cuentaBancaria, metodoPago, fechaPago, valor, observacion };
  return next();
}
