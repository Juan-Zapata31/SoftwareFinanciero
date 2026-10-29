const metodosPago = new Set(['transferencia', 'efectivo', 'tarjeta']);
const fechaIso = /^\d{4}-\d{2}-\d{2}$/;
const valorMonetario = /^\d{1,12}(?:\.\d{1,2})?$/;

export function validarIdIngreso(req, res, next) {
  if (!/^[1-9]\d*$/.test(req.params.id)) {
    return res.status(400).json({ message: 'El identificador del ingreso no es válido.' });
  }

  return next();
}

function validarDatosIngreso(datos) {
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
    return { error: 'Selecciona un usuario válido como cliente.' };
  }

  if (!metodosPago.has(metodoPago)) {
    return { error: 'Selecciona un método de pago válido.' };
  }

  if (metodoPago === 'transferencia') {
    if (!/^[0-9]{15}$/.test(cuentaBancaria)) {
      return { error: 'La cuenta bancaria debe contener exactamente 15 dígitos numéricos.' };
    }
  } else {
    cuentaBancaria = null;
  }

  if (!fechaValida) {
    return { error: 'Ingresa una fecha de pago válida.' };
  }

  if (!valorMonetario.test(valor) || Number(valor) <= 0) {
    return { error: 'El valor debe ser mayor que cero y tener máximo dos decimales.' };
  }

  if (observacion.length > 10000) {
    return { error: 'La observación no puede superar 10000 caracteres.' };
  }

  return {
    datos: { usuarioId, cuentaBancaria, metodoPago, fechaPago, valor, observacion },
  };
}

export function validarIngreso(req, res, next) {
  if (Array.isArray(req.body)) {
    if (req.body.length === 0 || req.body.length > 100) {
      return res.status(400).json({
        message: 'Envía entre 1 y 100 ingresos por solicitud.',
      });
    }

    const ingresos = [];
    for (const [indice, datos] of req.body.entries()) {
      if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        return res.status(400).json({
          message: `El ingreso en la posición ${indice + 1} debe ser un objeto JSON.`,
        });
      }

      const resultado = validarDatosIngreso(datos);
      if (resultado.error) {
        return res.status(400).json({
          message: `Ingreso ${indice + 1}: ${resultado.error}`,
        });
      }
      ingresos.push(resultado.datos);
    }

    req.body = ingresos;
    return next();
  }

  const resultado = validarDatosIngreso(req.body ?? {});
  if (resultado.error) {
    return res.status(400).json({ message: resultado.error });
  }

  req.body = resultado.datos;
  return next();
}
