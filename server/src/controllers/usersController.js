import { pool } from '../db.js';

export async function obtenerUsuarios(req, res) {
  try {
    const { rows } = await pool.query('SELECT id, name, "lastName", email FROM users');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener los usuarios de PostgreSQL:', error);
    return res.status(500).json({
      message: 'No fue posible obtener los usuarios de la base de datos.',
    });
  }
}

export async function crearUsuario(req, res) {
  const { name, lastName, email } = req.body;

  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, "lastName", email) VALUES ($1, $2, $3) RETURNING id, name, "lastName", email',
      [name, lastName, email]
    );

    return res.status(201).json({
      message: 'Usuario guardado correctamente',
      user: rows[0],
    });
  } catch (error) {
    console.error('Error al guardar el usuario en PostgreSQL:', error);

    if (error.code === '22001' || error.code === '23502' || error.code === '23514') {
      return res.status(400).json({
        message: 'Los datos no cumplen con las restricciones definidas en la base de datos.',
      });
    }

    return res.status(500).json({
      message: 'No fue posible guardar los datos en la base de datos.',
    });
  }
}

export async function actualizarUsuario(req, res) {
  const { id } = req.params;
  const { name, lastName, email } = req.body;

  try {
    const { rows } = await pool.query(
      'UPDATE users SET name = $1, "lastName" = $2, email = $3 WHERE id = $4 RETURNING id, name, "lastName", email',
      [name, lastName, email, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado.',
      });
    }

    return res.status(200).json({
      message: 'Usuario actualizado correctamente.',
      user: rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar el usuario en PostgreSQL:', error);

    if (error.code === '22001' || error.code === '23502' || error.code === '23514') {
      return res.status(400).json({
        message: 'Los datos no cumplen con las restricciones definidas en la base de datos.',
      });
    }

    return res.status(500).json({
      message: 'No fue posible actualizar los datos del usuario en la base de datos.',
    });
  }
}

export async function eliminarUsuario(req, res) {
  const { id } = req.params;

  try {
    const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado.',
      });
    }

    return res.status(200).json({
      message: 'Usuario eliminado correctamente.',
    });
  } catch (error) {
    console.error('Error al eliminar el usuario en PostgreSQL:', error);
    if (error.code === '23503') {
      return res.status(409).json({
        message: 'No se puede eliminar el usuario porque tiene ingresos asociados.',
      });
    }

    return res.status(500).json({
      message: 'No fue posible eliminar el usuario de la base de datos.',
    });
  }
}