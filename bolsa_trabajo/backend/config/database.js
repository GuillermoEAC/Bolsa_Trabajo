// Este archivo solo exporta la configuración de la base de datos.
const DbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  port: Number(process.env.DB_PORT) || 3306,
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'primerpaso_db',
};

// ✅ Exportación por defecto
export default DbConfig;
