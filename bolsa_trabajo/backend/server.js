// backend/Server.js
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import DbConfig from './config/database.js'; // Asegura que la ruta sea correcta
import dotenv from 'dotenv';

// Importación de Rutas
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
// import companyRoutes from './routes/company.routes.js'; // (A futuro)

dotenv.config();

const app = express();
const companyRoutes = require('./routes/company.routes'); // Importa las rutas
// --- MIDDLEWARES (Orden Crítico) ---
app.use(cors());
app.use(express.json()); // ⚠️ INDISPENSABLE para leer JSON
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
// --- BASE DE DATOS ---
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
    console.log('✅ Base de datos conectada correctamente.');
    app.locals.pool = pool; // Disponible para los controladores

    // --- RUTAS ---
    app.use('/auth', authRoutes);
    app.use('/api/student', studentRoutes);
    // app.use('/api/company', companyRoutes);
    app.use('/api/company', companyRoutes); // <-- ESTA LÍNEA ES CLAVE
    app.get('/', (req, res) => {
      res.json({ mensaje: 'API Primer Paso funcionando 🚀' });
    });

    app.listen(3000, () => {
      console.log('✅ Servidor corriendo en http://localhost:3000');
    });
  } catch (err) {
    console.error('❌ Error al conectar BD:', err);
    process.exit(1);
  }
}

start();
