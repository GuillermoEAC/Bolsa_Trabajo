import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// Asegúrate de que la ruta de importación sea correcta según tu estructura de carpetas
import {
  saveStudentProfile,
  getStudentProfile,
  uploadProfilePhoto,
} from '../controllers/student.controller.js';

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    // Crear la carpeta si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Nombre único: fecha + extensión original (ej: 123456789.jpg)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
router.post('/profile', saveStudentProfile);
router.get('/:id_usuario', getStudentProfile);
const upload = multer({ storage: storage });
// Guardar perfil (POST)
router.post('/profile', saveStudentProfile);

// Obtener perfil (GET) - El parámetro debe llamarse :id_usuario para coincidir con el controller
router.get('/:id_usuario', getStudentProfile);
router.post('/upload-photo', upload.single('foto'), uploadProfilePhoto);
export default router;
