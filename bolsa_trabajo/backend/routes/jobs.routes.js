// backend/routes/jobs.routes.js

import express from 'express';
const router = express.Router();
import { createJob, searchJobs, applyToJob } from '../controllers/jobs.controller.js';

// Rutas de Vacantes (Prefijo: /api/jobs)

// RF: Publicar ofertas laborales
router.post('/', createJob);

// RF: Búsqueda de vacantes (GET con query params)
router.get('/search', searchJobs);

// RF: Postularse a una vacante
router.post('/apply', applyToJob);

export default router;
