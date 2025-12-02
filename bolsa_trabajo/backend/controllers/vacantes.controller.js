// backend/controllers/vacantes.controller.js

// 3. ELIMINAR VACANTE
export const eliminarVacante = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;

  try {
    // Opcional: Verificar que la vacante pertenezca a la empresa del usuario antes de borrar
    await pool.query('DELETE FROM Vacante WHERE id_vacante = ?', [id]);
    res.json({ mensaje: 'Vacante eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo eliminar la vacante' });
  }
};

// 4. OBTENER UNA SOLA VACANTE (Para rellenar el formulario de edición)
export const obtenerVacantePorId = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM Vacante WHERE id_vacante = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Vacante no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener vacante' });
  }
};

// 5. ACTUALIZAR VACANTE
export const actualizarVacante = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { titulo, descripcion, ubicacion, modalidad, salario_min, salario_max } = req.body;

  try {
    await pool.query(
      `UPDATE Vacante SET 
       titulo_cargo=?, descripcion_vacante=?, ubicacion=?, tipo_trabajo=?, salario_min=?, salario_max=?
       WHERE id_vacante=?`,
      [titulo, descripcion, ubicacion, modalidad, salario_min, salario_max, id]
    );
    res.json({ mensaje: 'Vacante actualizada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar vacante' });
  }
};

// 1. FUNCIÓN PARA CREAR VACANTE
export const crearVacante = async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    const {
      id_usuario,
      titulo,
      descripcion,
      ubicacion,
      modalidad,
      tipo_contrato,
      salario_min,
      salario_max,
    } = req.body;

    console.log('📥 Intentando crear vacante para usuario:', id_usuario);

    if (!id_usuario || !titulo || !descripcion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    // Buscar el ID de la empresa
    const [empresas] = await pool.query('SELECT id_empresa FROM Empresa WHERE id_usuario = ?', [
      id_usuario,
    ]);

    if (empresas.length === 0) {
      return res.status(404).json({ error: 'No tienes un perfil de empresa creado.' });
    }

    const id_empresa = empresas[0].id_empresa;

    // Insertar la vacante
    const [result] = await pool.query(
      `INSERT INTO Vacante 
      (id_empresa, id_categoria, titulo_cargo, descripcion_vacante, ubicacion, tipo_trabajo, salario_min, salario_max, estado_activa, estado_aprobacion, fecha_publicacion) 
      VALUES (?, NULL, ?, ?, ?, ?, ?, ?, 1, 'PENDIENTE', NOW())`,
      [id_empresa, titulo, descripcion, ubicacion, modalidad, salario_min || 0, salario_max || 0]
    );

    res.status(201).json({
      mensaje: 'Oferta publicada con éxito.',
      id_vacante: result.insertId,
    });
  } catch (error) {
    console.error('❌ Error SQL al crear vacante:', error);
    res.status(500).json({ error: 'Error del servidor al guardar.' });
  }
};

// 2. FUNCIÓN PARA OBTENER MIS VACANTES (Esta es la que quizás faltaba o rompió el archivo)
export const obtenerMisVacantes = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario } = req.params;

  try {
    // Buscar empresa
    const [empresas] = await pool.query('SELECT id_empresa FROM Empresa WHERE id_usuario = ?', [
      id_usuario,
    ]);

    if (empresas.length === 0) {
      return res.status(404).json({ error: 'Usuario no es empresa.' });
    }
    const id_empresa = empresas[0].id_empresa;

    // Buscar vacantes
    const [vacantes] = await pool.query(
      `SELECT * FROM Vacante 
       WHERE id_empresa = ? 
       ORDER BY fecha_publicacion DESC`,
      [id_empresa]
    );

    res.json(vacantes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener vacantes' });
  }
};

export const buscarVacantes = async (req, res) => {
  const pool = req.app.locals.pool;
  // Recibimos los nuevos parámetros minSalario y maxSalario
  const { q, ubicacion, modalidad, minSalario, maxSalario } = req.query;

  try {
    let sql = `
      SELECT v.*, e.nombre_empresa, e.logo_path 
      FROM Vacante v
      INNER JOIN Empresa e ON v.id_empresa = e.id_empresa
      WHERE v.estado_activa = 1 AND v.estado_aprobacion = 'APROBADA' 
    `;

    const params = [];

    // Filtros de texto existentes...
    if (q) {
      sql += ` AND (v.titulo_cargo LIKE ? OR v.descripcion_vacante LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }
    if (ubicacion) {
      sql += ` AND v.ubicacion LIKE ?`;
      params.push(`%${ubicacion}%`);
    }
    if (modalidad) {
      sql += ` AND v.tipo_trabajo = ?`;
      params.push(modalidad);
    }

    // 🔥 NUEVO: Filtro de Rango Salarial
    // Lógica: "Muéstrame vacantes que paguen AL MENOS lo que yo pido"
    if (minSalario) {
      sql += ` AND v.salario_max >= ?`; // El tope de la vacante debe cubrir mi mínimo
      params.push(minSalario);
    }

    if (maxSalario) {
      sql += ` AND v.salario_min <= ?`; // El mínimo de la vacante no debe exceder mi máximo
      params.push(maxSalario);
    }

    sql += ` ORDER BY v.fecha_publicacion DESC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar vacantes' });
  }
};
