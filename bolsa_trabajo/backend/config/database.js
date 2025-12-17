// import { createPool } from 'mysql2/promise';
// import 'dotenv/config';

// export const pool = createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'PrimerPaso_DB',
//   port: process.env.DB_PORT || 3306,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

import { createPool } from 'mysql2/promise';
import 'dotenv/config';

export const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 👇 ESTO ES VITAL PARA TIDB EN RENDER
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
});
