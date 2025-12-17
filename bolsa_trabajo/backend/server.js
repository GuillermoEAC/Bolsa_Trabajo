import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ IMPORTAR LA CONFIGURACIÓN CORRECTA
import { pool } from './config/database.js';

// Rutas
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import companyRoutes from './routes/company.routes.js';
import vacantesRoutes from './routes/vacantes.routes.js';
import postulacionesRoutes from './routes/postulaciones.routes.js';
import favoritosRoutes from './routes/favoritos.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificacionesRoutes from './routes/notificaciones.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import statsRoutes from './routes/stats.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Pool disponible globalmente
app.locals.pool = pool;

// Rutas
app.use('/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/vacantes', vacantesRoutes);
app.use('/api/postulaciones', postulacionesRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/stats', statsRoutes);

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log('📚 Rutas disponibles:');
  console.log('   POST /auth/login');
  console.log('   POST /auth/registro');
  console.log('   GET  /api/analytics/empresa/:id_usuario');
  console.log('   GET  /api/notificaciones/usuario/:id_usuario');
});
