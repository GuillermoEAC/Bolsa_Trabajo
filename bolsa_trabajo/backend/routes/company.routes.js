import express from 'express';
import upload from '../config/multer.config.js';

import {
  registerCompany,
  obtenerEstadoEmpresa,
  getCompanyProfile,
  updateCompanyProfile,
} from '../controllers/company.controller.js';

const router = express.Router();

router.post('/register', upload.single('logo'), registerCompany);
router.get('/estado/:id_usuario', obtenerEstadoEmpresa);
router.get('/profile/:id_usuario', getCompanyProfile);
router.put('/profile/:id_usuario', upload.single('logo'), updateCompanyProfile);

export default router;
