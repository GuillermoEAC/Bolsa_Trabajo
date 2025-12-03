import express from 'express';
const router = express.Router();
import {
  registrarPostulacion,
  obtenerMisPostulaciones,
  obtenerCandidatosPorVacante,
  cambiarEstadoPostulacion, // 👈 Se mantiene
} from '../controllers/postulaciones.controller.js';
// Rutas para Estudiantes
router.post('/aplicar', registrarPostulacion);
router.get('/historial/:id_usuario', obtenerMisPostulaciones);

// Rutas para Empresas (Actualización de estado)
router.get('/vacante/:id_vacante', obtenerCandidatosPorVacante);
// MANTENEMOS ESTA RUTA Y MÉTODO
router.put('/estado/:id_postulacion', cambiarEstadoPostulacion);

export default router;
