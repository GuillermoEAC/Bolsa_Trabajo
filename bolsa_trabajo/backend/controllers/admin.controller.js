// 1. OBTENER EMPRESAS (Para validación)
export const obtenerEmpresas = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    // Traemos todas las empresas, poniendo las NO validadas primero
    const [empresas] = await pool.query(
      'SELECT * FROM Empresa ORDER BY validada ASC, id_empresa DESC'
    );
    res.json(empresas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener empresas' });
  }
};

// 2. VALIDAR / DESACTIVAR EMPRESA
export const validarEmpresa = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { estado } = req.body; // true (1) o false (0)

  try {
    await pool.query('UPDATE Empresa SET validada = ? WHERE id_empresa = ?', [estado, id]);
    res.json({ mensaje: `Empresa ${estado ? 'validada' : 'desactivada'} correctamente.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar estado de empresa' });
  }
};

// 3. OBTENER VACANTES (Para moderación)
export const obtenerVacantesAdmin = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [vacantes] = await pool.query(`
      SELECT v.*, e.nombre_empresa 
      FROM Vacante v
      JOIN Empresa e ON v.id_empresa = e.id_empresa
      ORDER BY FIELD(v.estado_aprobacion, 'PENDIENTE', 'APROBADA', 'RECHAZADA'), v.fecha_publicacion DESC
    `);
    res.json(vacantes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener vacantes' });
  }
};

// 4. APROBAR / RECHAZAR VACANTE
export const moderarVacante = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { estado } = req.body; // 'APROBADA' o 'RECHAZADA'

  try {
    await pool.query('UPDATE Vacante SET estado_aprobacion = ? WHERE id_vacante = ?', [estado, id]);
    res.json({ mensaje: `Vacante ${estado.toLowerCase()} correctamente.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al moderar vacante' });
  }
};

// 5. ELIMINAR VACANTE (Admin)
export const eliminarVacanteAdmin = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;

  try {
    // Primero borramos las postulaciones asociadas para evitar error de llave foránea
    await pool.query('DELETE FROM Postulacion WHERE id_vacante = ?', [id]);
    // Luego borramos la vacante
    await pool.query('DELETE FROM Vacante WHERE id_vacante = ?', [id]);

    res.json({ mensaje: 'Vacante eliminada permanentemente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar vacante' });
  }
};
