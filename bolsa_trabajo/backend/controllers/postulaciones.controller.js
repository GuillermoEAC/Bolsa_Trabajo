export const registrarPostulacion = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario, id_vacante } = req.body;

  try {
    const [estudiantes] = await pool.query(
      'SELECT id_estudiante FROM Estudiante WHERE id_usuario = ?',
      [id_usuario]
    );
    if (estudiantes.length === 0) return res.status(403).json({ error: 'Solo estudiantes.' });

    const id_estudiante = estudiantes[0].id_estudiante;

    const [existente] = await pool.query(
      'SELECT id_postulacion FROM Postulacion WHERE id_estudiante = ? AND id_vacante = ?',
      [id_estudiante, id_vacante]
    );
    if (existente.length > 0) return res.status(400).json({ error: 'Ya estás postulado.' });

    await pool.query(
      `INSERT INTO Postulacion (id_estudiante, id_vacante, fecha_postulacion, estado_postulacion) 
       VALUES (?, ?, NOW(), 'Postulado')`,
      [id_estudiante, id_vacante]
    );

    res.status(201).json({ mensaje: 'Postulación enviada.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al postular.' });
  }
};

// 2. OBTENER HISTORIAL (Para el estudiante)
export const obtenerMisPostulaciones = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT p.*, v.titulo_cargo, v.ubicacion, e.nombre_empresa, e.logo_path
      FROM Postulacion p
      JOIN Estudiante st ON p.id_estudiante = st.id_estudiante
      JOIN Vacante v ON p.id_vacante = v.id_vacante
      JOIN Empresa e ON v.id_empresa = e.id_empresa
      WHERE st.id_usuario = ?
      ORDER BY p.fecha_postulacion DESC
    `,
      [id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial.' });
  }
};

// 🔥 3. OBTENER CANDIDATOS DE UNA VACANTE (Para la Empresa)
export const obtenerCandidatosPorVacante = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_vacante } = req.params;

  try {
    // Hacemos JOIN con Estudiante y Usuario para traer nombres y correo
    const [candidatos] = await pool.query(
      `
      SELECT 
        p.id_postulacion, 
        p.fecha_postulacion, 
        p.estado_postulacion,
        e.id_estudiante,
        e.nombre, 
        e.apellido, 
        e.titulo_cv, 
        e.telefono,
        e.descripcion,
        u.email
      FROM Postulacion p
      JOIN Estudiante e ON p.id_estudiante = e.id_estudiante
      JOIN Usuario u ON e.id_usuario = u.id_usuario
      WHERE p.id_vacante = ?
      ORDER BY p.fecha_postulacion DESC
    `,
      [id_vacante]
    );

    res.json(candidatos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener candidatos.' });
  }
};

// 🔥 4. CAMBIAR ESTADO (Para la Empresa: "Visto", "Entrevista", "Rechazado")
export const cambiarEstadoPostulacion = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_postulacion } = req.params;
  const { nuevo_estado } = req.body;

  try {
    await pool.query('UPDATE Postulacion SET estado_postulacion = ? WHERE id_postulacion = ?', [
      nuevo_estado,
      id_postulacion,
    ]);
    res.json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar estado.' });
  }
};
