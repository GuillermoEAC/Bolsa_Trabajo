import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import vacantesRoutes from './routes/vacantes.routes.js';
import postulacionesRoutes from './routes/postulaciones.routes.js';
// Importar configuración de DB
import DbConfig from './config/database.js';
import adminRoutes from './routes/admin.routes.js';
// Importar Rutas
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import companyRoutes from './routes/company.routes.js';
import favoritosRoutes from './routes/favoritos.routes.js';

dotenv.config();

// Configuración para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/vacantes', vacantesRoutes);
app.use('/api/favoritos', favoritosRoutes);
// --- STATIC FILES ---
// Esto permite que el navegador acceda a las imágenes en http://localhost:3000/uploads/...
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/admin', adminRoutes);
// --- DATABASE ---
const dbConfig = DbConfig;
let pool;

async function start() {
  try {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
    });

    await pool.query('SELECT 1');
    console.log('✅ Base de datos conectada.');

    // Hacer el pool accesible globalmente en req.app.locals
    app.locals.pool = pool;

    // --- RUTAS ---
    app.get('/', (req, res) => {
      res.json({ mensaje: 'API Funcionando 🚀' });
    });

    app.use('/auth', authRoutes);
    app.use('/api/student', studentRoutes);
    app.use('/api/company', companyRoutes); // Ruta de empresas
    app.use('/api/vacantes', vacantesRoutes);
    app.use('/api/postulaciones', postulacionesRoutes);
    app.use('/api/favoritos', favoritosRoutes);
    // Iniciar servidor
    app.listen(3000, () => {
      console.log('✅ Servidor corriendo en http://localhost:3000');
    });
  } catch (err) {
    console.error('❌ Error al conectar BD o iniciar servidor:', err);
    process.exit(1);
  }
}

start();
