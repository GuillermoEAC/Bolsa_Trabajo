import express from 'express';
const router = express.Router();

import { login, registro } from '../controllers/auth.controller.js';

router.post('/login', login);
router.post('/registro', registro);

export default router;
