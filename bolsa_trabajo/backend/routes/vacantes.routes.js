import express from 'express';
const router = express.Router();

// 👇 AQUÍ ESTABA EL ERROR: Faltaba agregar las nuevas funciones a la lista de importación
import {
  crearVacante,
  obtenerMisVacantes,
  eliminarVacante, // <--- Faltaba esto
  obtenerVacantePorId, // <--- Faltaba esto
  actualizarVacante, // <--- Faltaba esto
  buscarVacantes, // <--- IMPORTAR ESTO
} from '../controllers/vacantes.controller.js';

// 1. CREAR
router.post('/crear', crearVacante);
router.get('/usuario/:id_usuario', obtenerMisVacantes);
router.get('/detalle/:id', obtenerVacantePorId);
router.put('/actualizar/:id', actualizarVacante);
router.delete('/eliminar/:id', eliminarVacante);
router.get('/buscar', buscarVacantes);
export default router;
