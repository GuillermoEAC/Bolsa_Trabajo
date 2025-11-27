// backend/routes/student.routes.js
import express from 'express';
const router = express.Router();
import { saveStudentProfile } from '../controllers/student.controller.js';

// Ruta para guardar o actualizar el perfil completo del estudiante
// POST /api/student/profile
router.post('/profile', saveStudentProfile);

export default router;
