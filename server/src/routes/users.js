import { Router } from 'express';
import { crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } from '../controllers/usersController.js';
import { validarUsuario } from '../middleware/validateUser.js';

const router = Router();

router.post('/', validarUsuario, crearUsuario);
router.get('/', obtenerUsuarios);
router.put('/:id', validarUsuario, actualizarUsuario);
router.delete('/:id', eliminarUsuario);

export default router;
