// import express from 'express';
// import cors from 'cors';
// import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

// dotenv.config();

// // Rutas
// import authRoutes from './routes/auth.routes.js';
// import studentRoutes from './routes/student.routes.js';
// import companyRoutes from './routes/company.routes.js';
// import vacantesRoutes from './routes/vacantes.routes.js';
// import postulacionesRoutes from './routes/postulaciones.routes.js';
// import favoritosRoutes from './routes/favoritos.routes.js';
// import adminRoutes from './routes/admin.routes.js';
// import notificacionesRoutes from './routes/notificaciones.routes.js';
// import analyticsRoutes from './routes/analytics.routes.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middlewares
// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Conexión DB
// // const pool = mysql.createPool({
// //   host: process.env.DB_HOST || 'localhost',
// //   user: process.env.DB_USER || 'root',
// //   password: process.env.DB_PASSWORD || '',
// //   database: process.env.DB_NAME || 'bolsa_trabajo',
// //   waitForConnections: true,
// //   connectionLimit: 10,
// //   queueLimit: 0,
// // });

// const pool = mysql.createPool({
//   host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
//   user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
//   password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
//   database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'bolsa_trabajo',
//   port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// app.locals.pool = pool;

// pool
//   .getConnection()
//   .then(() => console.log('✅ Base de datos conectada.'))
//   .catch((err) => console.error('❌ Error de conexión DB:', err));

// // Rutas
// app.use('/auth', authRoutes);
// app.use('/api/student', studentRoutes);
// app.use('/api/company', companyRoutes);
// app.use('/api/vacantes', vacantesRoutes);
// app.use('/api/postulaciones', postulacionesRoutes);
// app.use('/api/favoritos', favoritosRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/notificaciones', notificacionesRoutes);
// app.use('/api/analytics', analyticsRoutes);

// app.listen(PORT, () => {
//   console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
//   console.log('📚 Rutas disponibles:');
//   console.log('   POST /auth/login');
//   console.log('   POST /auth/registro');
//   console.log('   GET  /api/analytics/empresa/:id_usuario');
//   console.log('   GET  /api/notificaciones/usuario/:id_usuario');
//   console.log(' Si se actuliza solo?');
// });

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('🔍 Configuración de Base de Datos:');
console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
console.log('MYSQL_USER:', process.env.MYSQL_USER);
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
console.log('MYSQL_PORT:', process.env.MYSQL_PORT);
console.log('MYSQL_PASSWORD existe:', !!process.env.MYSQL_PASSWORD);
console.log('DB_HOST (fallback):', process.env.DB_HOST);
console.log('---');

// Conexión DB - Compatible con Railway (MYSQL_*) y local (DB_*)
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'bolsa_trabajo',
  port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.locals.pool = pool;

pool
  .getConnection()
  .then(() => console.log('✅ Base de datos conectada.'))
  .catch((err) => console.error('❌ Error de conexión DB:', err));

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

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log('📚 Rutas disponibles:');
  console.log('   POST /auth/login');
  console.log('   POST /auth/registro');
  console.log('   GET  /api/analytics/empresa/:id_usuario');
  console.log('   GET  /api/notificaciones/usuario/:id_usuario');
});
