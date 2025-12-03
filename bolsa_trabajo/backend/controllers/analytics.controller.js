import { clearScreenDown } from 'readline';

export const obtenerEstadisticasEmpresa = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario } = req.params;

  try {
    const [empresa] = await pool.query('SELECT id_empresa FROM Empresa WHERE id_usuario = ?', [
      id_usuario,
    ]);

    if (empresa.length === 0) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const id_empresa = empresa[0].id_empresa;

    const [totalVacantes] = await pool.query(
      'SELECT COUNT(*) as total FROM Vacante WHERE id_empresa = ?',
      [id_empresa]
    );

    const [totalPostulaciones] = await pool.query(
      `SELECT COUNT(*) as total 
       FROM Postulacion p 
       JOIN Vacante v ON p.id_vacante = v.id_vacante 
       WHERE v.id_empresa = ?`,
      [id_empresa]
    );

    const [vacantesMasPostuladas] = await pool.query(
      `SELECT v.titulo_cargo, v.id_vacante, COUNT(p.id_postulacion) as postulaciones
       FROM Vacante v
       LEFT JOIN Postulacion p ON v.id_vacante = p.id_vacante
       WHERE v.id_empresa = ?
       GROUP BY v.id_vacante
       ORDER BY postulaciones DESC 
       LIMIT 5`,
      [id_empresa]
    );

    res.json({
      totalVacantes: totalVacantes[0].total,
      totalPostulaciones: totalPostulaciones[0].total,
      vacantesMasPostuladas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
clearScreenDown;
