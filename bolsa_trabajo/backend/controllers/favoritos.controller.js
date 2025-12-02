export const toggleFavorito = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario, id_vacante } = req.body;

  try {
    // 1. Obtener ID de estudiante
    const [est] = await pool.query('SELECT id_estudiante FROM Estudiante WHERE id_usuario = ?', [
      id_usuario,
    ]);

    if (est.length === 0) {
      return res.status(403).json({ error: 'Solo los estudiantes pueden guardar favoritos.' });
    }
    const id_estudiante = est[0].id_estudiante;

    // 2. Verificar si ya existe
    const [existente] = await pool.query(
      'SELECT * FROM Favorito WHERE id_estudiante = ? AND id_vacante = ?',
      [id_estudiante, id_vacante]
    );

    if (existente.length > 0) {
      // BORRAR (Quitar like)
      await pool.query('DELETE FROM Favorito WHERE id_estudiante = ? AND id_vacante = ?', [
        id_estudiante,
        id_vacante,
      ]);
      return res.json({ mensaje: 'Eliminado de favoritos', estado: false });
    } else {
      // INSERTAR (Dar like)
      await pool.query('INSERT INTO Favorito (id_estudiante, id_vacante) VALUES (?, ?)', [
        id_estudiante,
        id_vacante,
      ]);
      return res.json({ mensaje: 'Agregado a favoritos', estado: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al gestionar favorito' });
  }
};

export const obtenerFavoritos = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT v.*, e.nombre_empresa, e.logo_path, f.fecha_agregado
      FROM Favorito f
      JOIN Estudiante st ON f.id_estudiante = st.id_estudiante
      JOIN Vacante v ON f.id_vacante = v.id_vacante
      JOIN Empresa e ON v.id_empresa = e.id_empresa
      WHERE st.id_usuario = ?
      ORDER BY f.fecha_agregado DESC
    `,
      [id_usuario]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
};
