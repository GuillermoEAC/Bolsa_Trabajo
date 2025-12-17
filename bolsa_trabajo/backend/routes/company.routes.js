// Backend/routes/company.routes.js
import express from 'express';
import upload from '../config/multer.config.js';
import { registerCompany, obtenerEstadoEmpresa } from '../controllers/company.controller.js'; // <--- Import modificado

const router = express.Router();

// POST /api/company/register
router.post('/register', upload.single('logo'), registerCompany);

// GET /api/company/estado/:id_usuario (NUEVA RUTA)
router.get('/estado/:id_usuario', obtenerEstadoEmpresa);

export default router;
