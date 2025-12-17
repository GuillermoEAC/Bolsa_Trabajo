import { pool } from '../config/database.js';

export const obtenerContadoresPublicos = async (req, res) => {
  try {
    // Consulta simplificada para evitar errores de sintaxis anidada
    const [empresas] = await pool.query('SELECT COUNT(*) as total FROM Empresa WHERE validada = 1');
    const [vacantes] = await pool.query(
      "SELECT COUNT(*) as total FROM Vacante WHERE estado_aprobacion = 'APROBADA'"
    );

    // Construimos la respuesta con los datos reales
    const respuesta = {
      total_empresas: empresas[0].total || 0,
      total_vacantes: vacantes[0].total || 0,
    };

    console.log('✅ Stats enviadas:', respuesta); // Esto te ayudará a ver en la terminal si funciona
    res.json(respuesta);
  } catch (error) {
    console.error('❌ Error crítico en stats:', error);
    // Devolvemos 0 para que no explote el frontend
    res.status(500).json({ total_empresas: 0, total_vacantes: 0 });
  }
};
