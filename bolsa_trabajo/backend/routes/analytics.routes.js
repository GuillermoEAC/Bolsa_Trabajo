import express from 'express';
const router = express.Router();
import { obtenerEstadisticasEmpresa } from '../controllers/analytics.controller.js';

router.get('/empresa/:id_usuario', obtenerEstadisticasEmpresa);

export default router;
