import express from 'express';
const router = express.Router();
import { toggleFavorito, obtenerFavoritos } from '../controllers/favoritos.controller.js';

router.post('/toggle', toggleFavorito);
router.get('/usuario/:id_usuario', obtenerFavoritos);

export default router;
