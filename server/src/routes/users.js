import { Router } from 'express';
import { crearUsuario } from '../controllers/usersController.js';
import { validarUsuario } from '../middleware/validateUser.js';

const router = Router();

router.post('/', validarUsuario, crearUsuario);

export default router;
