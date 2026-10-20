import { Router } from 'express';
import { crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } from '../controllers/usersController.js';
import { validarUsuario } from '../middleware/validateUser.js';

const router = Router();

router.post('/', validarUsuario, crearUsuario); //endpoint para crear un usuario localhost:3000/api/users

router.get('/', obtenerUsuarios); //endpoint para obtener todos los usuarios localhost:3000/api/users

router.put('/:id', validarUsuario, actualizarUsuario); //endpoint para actualizar un usuario por id localhost:3000/api/users/:id

router.delete('/:id', eliminarUsuario); //endpoint para eliminar un usuario por id localhost:3000/api/users/:id

export default router;
