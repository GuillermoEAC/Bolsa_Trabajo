// import express from 'express';
// const router = express.Router();

// import {
//   getAllVacantes,
//   getVacantesByEmpresa,
//   createVacante,
//   getVacanteById,
//   deleteVacante,
//   actualizarVacante,
// } from '../controllers/vacantes.controller.js';

// // Rutas Públicas (Buscador)
// router.get('/', getAllVacantes);
// router.get('/detalle/:id', getVacanteById);

// // Rutas Empresa
// router.get('/usuario/:id_usuario', getVacantesByEmpresa);
// router.post('/crear', createVacante);
// router.put('/actualizar/:id', actualizarVacante);
// router.delete('/:id', deleteVacante);

// export default router;

import express from 'express';
const router = express.Router();

import {
  buscarVacantes,
  obtenerVacantePorId,
  obtenerMisVacantes,
  crearVacante,
  actualizarVacante,
  eliminarVacante,
  obtenerCategorias,
} from '../controllers/vacantes.controller.js';
import { validarVacante } from '../middleware/validaciones.js';

router.post('/crear', validarVacante, crearVacante);
router.get('/usuario/:id_usuario', obtenerMisVacantes);
router.get('/detalle/:id', obtenerVacantePorId);
router.put('/actualizar/:id', actualizarVacante);
router.delete('/eliminar/:id', eliminarVacante);
router.get('/buscar', buscarVacantes);
router.get('/categorias', obtenerCategorias);

export default router;
