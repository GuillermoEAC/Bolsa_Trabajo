import { createPool } from 'mysql2/promise';
import 'dotenv/config';

console.log('🔌 Iniciando configuración de DB...');
console.log('   -> Host detectado:', process.env.DB_HOST);

// Validación de variables críticas
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingVars);
  throw new Error(`Configuración incompleta: ${missingVars.join(', ')}`);
}

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 4000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Activar SSL para TiDB Cloud
const esTiDB = process.env.DB_HOST.includes('tidbcloud');

if (esTiDB) {
  console.log('🔒 Modo TiDB Cloud: Activando SSL obligatorio.');
  dbConfig.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  };
}

console.log('🔍 Configuración final (sin password):');
console.log({
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  ssl: dbConfig.ssl ? 'Habilitado' : 'Deshabilitado',
});

export const pool = createPool(dbConfig);

// Test de conexión
pool
  .getConnection()
  .then((conn) => {
    console.log('✅ Conexión a DB exitosa');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Error de conexión DB:', err.message);
  });
