import express from 'express';
const router = express.Router();
import {
  registrarPostulacion,
  obtenerMisPostulaciones,
  obtenerCandidatosPorVacante, // 👈 Importar esto
  cambiarEstadoPostulacion, // 👈 Importar esto
} from '../controllers/postulaciones.controller.js';

// Rutas para Estudiantes
router.post('/aplicar', registrarPostulacion);
router.get('/historial/:id_usuario', obtenerMisPostulaciones);

// Rutas para Empresas (ESTAS SON LAS QUE FALTABAN O FALLABAN)
router.get('/vacante/:id_vacante', obtenerCandidatosPorVacante);
router.put('/estado/:id_postulacion', cambiarEstadoPostulacion);

export default router;
