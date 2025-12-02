import express from 'express';
const router = express.Router();

// Importamos TODAS las funciones del controlador
import {
  obtenerEmpresas,
  validarEmpresa,
  obtenerVacantesAdmin, // 👈 Asegúrate de importar esto
  moderarVacante, // 👈 Y esto
  eliminarVacanteAdmin, // 👈 Y esto
} from '../controllers/admin.controller.js';

// --- Rutas de Empresas ---
router.get('/empresas', obtenerEmpresas);
router.put('/validar/:id', validarEmpresa);

// --- Rutas de Vacantes (ESTAS SON LAS QUE FALTAN) ---
router.get('/vacantes', obtenerVacantesAdmin);
router.put('/vacantes/estado/:id', moderarVacante);
router.delete('/vacantes/:id', eliminarVacanteAdmin);

export default router;
