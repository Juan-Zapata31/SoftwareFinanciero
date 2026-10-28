import { Router } from 'express';
import {
  actualizarIngreso,
  crearIngreso,
  eliminarIngreso,
  obtenerIngresos,
} from '../controllers/incomesController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validarIdIngreso, validarIngreso } from '../middleware/validateIncome.js';

const router = Router();

router.use(requireAuth);
router.get('/', obtenerIngresos);
router.post('/', validarIngreso, crearIngreso);
router.put('/:id', validarIdIngreso, validarIngreso, actualizarIngreso);
router.delete('/:id', validarIdIngreso, eliminarIngreso);

export default router;
