import express from 'express';
const router = express.Router();
import {
  crearNotificacion,
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasLeidas,
} from '../controllers/notificaciones.controller.js';

router.post('/', crearNotificacion);
router.get('/usuario/:id_usuario', obtenerNotificaciones);
router.put('/leer/:id', marcarComoLeida);
router.put('/leer-todas/:id_usuario', marcarTodasLeidas);

export default router;
