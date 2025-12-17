// backend/routes/stats.routes.js
import { Router } from 'express';

import { obtenerContadoresPublicos } from '../controllers/stats.controller.js';

const router = Router();

router.get('/publicos', obtenerContadoresPublicos);

export default router;
