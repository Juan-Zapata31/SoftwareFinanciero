import { pool } from '../db.js';

const columnasIngreso = `
  i.id,
  i.usuario_id AS "usuarioId",
  CONCAT_WS(' ', u.name, u."lastName") AS cliente,
  u.email AS "clienteEmail",
  i.cuenta_bancaria AS "cuentaBancaria",
  i.metodo_pago AS "metodoPago",
  TO_CHAR(i.fecha_pago, 'YYYY-MM-DD') AS "fechaPago",
  i.valor,
  i.observacion,
  i.creado_en AS "creadoEn"
`;

export async function obtenerIngresos(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT ${columnasIngreso}
       FROM ingresos i
       JOIN users u ON u.id = i.usuario_id
       ORDER BY i.fecha_pago DESC, i.id DESC`,
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener los ingresos de PostgreSQL:', error);
    return res.status(500).json({
      message: 'No fue posible consultar los ingresos en la base de datos.',
    });
  }
}

export async function crearIngreso(req, res) {
  if (Array.isArray(req.body)) {
    const client = await pool.connect();
    let transaccionIniciada = false;

    try {
      await client.query('BEGIN');
      transaccionIniciada = true;
      const ingresos = [];

      for (const datos of req.body) {
        const { rows } = await client.query(
          `WITH inserted AS (
             INSERT INTO ingresos
               (usuario_id, cuenta_bancaria, metodo_pago, fecha_pago, valor, observacion)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *
           )
           SELECT ${columnasIngreso}
           FROM inserted i
           JOIN users u ON u.id = i.usuario_id`,
          [
            datos.usuarioId,
            datos.cuentaBancaria,
            datos.metodoPago,
            datos.fechaPago,
            datos.valor,
            datos.observacion || null,
          ],
        );
        ingresos.push(rows[0]);
      }

      await client.query('COMMIT');
      return res.status(201).json({
        message: `${ingresos.length} ingresos guardados correctamente.`,
        ingresos,
      });
    } catch (error) {
      console.error('Error al guardar el lote de ingresos en PostgreSQL:', error);
      if (transaccionIniciada) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('Error al revertir el lote de ingresos en PostgreSQL:', rollbackError);
        }
      }
      if (error.code === '23503') {
        return res.status(400).json({ message: 'Uno de los usuarios seleccionados ya no existe.' });
      }
      return res.status(500).json({
        message: 'No fue posible guardar los ingresos en la base de datos.',
      });
    } finally {
      client.release();
    }
  }

  const { usuarioId, cuentaBancaria, metodoPago, fechaPago, valor, observacion } = req.body;

  try {
    const { rows } = await pool.query(
      `WITH inserted AS (
         INSERT INTO ingresos
           (usuario_id, cuenta_bancaria, metodo_pago, fecha_pago, valor, observacion)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *
       )
       SELECT ${columnasIngreso}
       FROM inserted i
       JOIN users u ON u.id = i.usuario_id`,
      [usuarioId, cuentaBancaria, metodoPago, fechaPago, valor, observacion || null],
    );

    return res.status(201).json({
      message: 'Ingreso guardado correctamente.',
      ingreso: rows[0],
    });
  } catch (error) {
    console.error('Error al guardar el ingreso en PostgreSQL:', error);
    if (error.code === '23503') {
      return res.status(400).json({ message: 'El usuario seleccionado ya no existe.' });
    }
    return res.status(500).json({
      message: 'No fue posible guardar el ingreso en la base de datos.',
    });
  }
}

export async function actualizarIngreso(req, res) {
  const { id } = req.params;
  const { usuarioId, cuentaBancaria, metodoPago, fechaPago, valor, observacion } = req.body;

  try {
    const { rows } = await pool.query(
      `WITH updated AS (
         UPDATE ingresos AS i
         SET usuario_id = $1,
             cuenta_bancaria = $2,
             metodo_pago = $3,
             fecha_pago = $4,
             valor = $5,
             observacion = $6
         WHERE i.id = $7
         RETURNING i.*
       )
       SELECT ${columnasIngreso}
       FROM updated i
       JOIN users u ON u.id = i.usuario_id`,
      [usuarioId, cuentaBancaria, metodoPago, fechaPago, valor, observacion || null, id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ingreso no encontrado.' });
    }

    return res.status(200).json({
      message: 'Ingreso actualizado correctamente.',
      ingreso: rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar el ingreso en PostgreSQL:', error);
    if (error.code === '23503') {
      return res.status(400).json({ message: 'El usuario seleccionado ya no existe.' });
    }
    return res.status(500).json({
      message: 'No fue posible actualizar el ingreso en la base de datos.',
    });
  }
}

export async function eliminarIngreso(req, res) {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      'DELETE FROM ingresos WHERE id = $1 RETURNING id',
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ingreso no encontrado.' });
    }

    return res.status(200).json({ message: 'Ingreso eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar el ingreso de PostgreSQL:', error);
    return res.status(500).json({
      message: 'No fue posible eliminar el ingreso de la base de datos.',
    });
  }
}
