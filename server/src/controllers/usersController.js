import { pool } from '../db.js';

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
