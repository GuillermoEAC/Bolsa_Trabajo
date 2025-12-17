import { createPool } from 'mysql2/promise';
import 'dotenv/config';

// 1. Logs de diagnóstico (Para ver en el Dashboard de Render)
console.log('🔌 Iniciando configuración de DB...');
console.log('   -> Host detectado:', process.env.DB_HOST);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'PrimerPaso_DB',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// 2. Lógica BLINDADA para activar SSL
// Verificamos si el host es de TiDB Cloud específicamente
const esTiDB = process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud');
const esProduccion = process.env.DB_HOST && process.env.DB_HOST !== 'localhost';

if (esTiDB || esProduccion) {
  console.log('🔒 Modo Nube/TiDB detectado: Activando SSL obligatorio.');
  dbConfig.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  };
  // Aseguramos el puerto 4000 si es TiDB
  if (esTiDB) {
    dbConfig.port = 4000;
  }
} else {
  console.log('🏠 Modo Local detectado: SSL desactivado.');
}

export const pool = createPool(dbConfig);
