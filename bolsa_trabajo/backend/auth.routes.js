import express from 'express';
const router = express.Router();

// Importamos los controladores
import { login, registro } from '../controllers/auth.controller.js';

// Rutas (Endpoints)
router.post('/login', login);
router.post('/registro', registro);

export default router;
