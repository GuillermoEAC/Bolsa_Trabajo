import express from 'express';
import upload from '../config/multer.config.js'; // Importar config de Multer
import { registerCompany } from '../controllers/company.controller.js'; // Importar controlador

const router = express.Router();

// POST /api/company/register
// 'logo' es el nombre del campo que debes usar en el FormData del frontend
router.post('/register', upload.single('logo'), registerCompany);

export default router;
