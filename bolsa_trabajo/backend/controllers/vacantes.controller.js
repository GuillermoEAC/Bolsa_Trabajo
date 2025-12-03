// file:///C:/Users/guill/.../controllers/vacantes.controller.js

import { crearNotificacionInterna } from './notificaciones.controller.js';

// ==========================================
// 1. OBTENER TODAS LAS VACANTES (PÚBLICO)
// ==========================================
export const buscarVacantes = async (req, res) => {
  const pool = req.app.locals.pool;
  const { q, ubicacion, modalidad, minSalario, maxSalario, tipoContrato, fecha } = req.query;

  try {
    console.log('🔍 Parámetros de búsqueda:', req.query); // 🔥 Debug

    let sql = `
      SELECT v.*, e.nombre_empresa, e.logo_path 
      FROM Vacante v
      INNER JOIN Empresa e ON v.id_empresa = e.id_empresa
      WHERE v.estado_aprobacion = 'APROBADA'
      AND e.validada = 1
    `;

    const params = [];

    // Filtro de búsqueda general
    if (q && q.trim() !== '') {
      sql += ` AND (v.titulo_cargo LIKE ? OR v.descripcion_vacante LIKE ? OR e.nombre_empresa LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    // Filtro de ubicación
    if (ubicacion && ubicacion.trim() !== '') {
      sql += ` AND v.ubicacion LIKE ?`;
      params.push(`%${ubicacion}%`);
    }

    // Filtro de modalidad
    if (modalidad && modalidad.trim() !== '') {
      sql += ` AND v.tipo_trabajo = ?`;
      params.push(modalidad);
    }

    // Filtro de tipo de contrato (si lo tienes en tu BD)
    if (tipoContrato && tipoContrato.trim() !== '') {
      sql += ` AND v.tipo_contrato = ?`;
      params.push(tipoContrato);
    }

    // Filtro de rango salarial
    if (minSalario && !isNaN(minSalario)) {
      sql += ` AND v.salario_max >= ?`;
      params.push(parseInt(minSalario));
    }

    if (maxSalario && !isNaN(maxSalario)) {
      sql += ` AND v.salario_min <= ?`;
      params.push(parseInt(maxSalario));
    }

    // Ordenar por fecha
    sql += ` ORDER BY v.fecha_publicacion DESC`;

    console.log('📊 SQL Query:', sql); // 🔥 Debug
    console.log('📊 Params:', params); // 🔥 Debug

    const [rows] = await pool.query(sql, params);

    console.log('✅ Vacantes encontradas:', rows.length); // 🔥 Debug

    res.json(rows);
  } catch (error) {
    console.error('❌ Error al buscar vacantes:', error);
    res.status(500).json({ error: 'Error al buscar vacantes' });
  }
};

// ==========================================
// 2. OBTENER VACANTE POR ID (PÚBLICO)
// ==========================================
export const obtenerVacantePorId = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `
        SELECT v.*, e.nombre_empresa, e.logo_path, e.descripcion as descripcion_empresa
        FROM Vacante v
        JOIN Empresa e ON v.id_empresa = e.id_empresa
        WHERE v.id_vacante = ?
      `,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Vacante no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener vacante por ID:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// ==========================================
// 3. OBTENER VACANTES DE UNA EMPRESA (PANEL EMPRESA)
// Nombre Corregido de getVacantesByEmpresa a obtenerMisVacantes
// ==========================================
export const obtenerMisVacantes = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario } = req.params;

  try {
    console.log('🔍 Buscando vacantes para usuario:', id_usuario); // 🔥 Debug

    // 1. Buscar empresa
    const [empresas] = await pool.query('SELECT id_empresa FROM Empresa WHERE id_usuario = ?', [
      id_usuario,
    ]);

    if (empresas.length === 0) {
      console.log('❌ Usuario no es empresa');
      return res.status(404).json({ error: 'Usuario no es empresa.' });
    }

    const id_empresa = empresas[0].id_empresa;
    console.log('✅ ID Empresa encontrado:', id_empresa); // 🔥 Debug

    // 2. Buscar vacantes
    const [vacantes] = await pool.query(
      `SELECT * FROM Vacante 
       WHERE id_empresa = ? 
       ORDER BY fecha_publicacion DESC`,
      [id_empresa]
    );

    console.log('📊 Vacantes encontradas:', vacantes.length); // 🔥 Debug
    res.json(vacantes);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Error al obtener vacantes' });
  }
};

// O si se llama getVacantesByEmpresa
export const getVacantesByEmpresa = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario } = req.params;

  try {
    console.log('🔍 Buscando vacantes para usuario:', id_usuario);

    const [rows] = await pool.query(
      `SELECT v.* FROM Vacante v
       JOIN Empresa e ON v.id_empresa = e.id_empresa
       WHERE e.id_usuario = ?
       ORDER BY v.fecha_publicacion DESC`,
      [id_usuario]
    );

    console.log('📊 Vacantes encontradas:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Error al obtener tus vacantes' });
  }
};

// ==========================================
// 4. CREAR NUEVA VACANTE
// Nombre Corregido de createVacante a crearVacante
// ==========================================
export const crearVacante = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_empresa, ...datosVacante } = req.body;

  try {
    const [result] = await pool.query('INSERT INTO Vacante SET ?', { ...datosVacante, id_empresa });

    // 🔥 CREAR NOTIFICACIÓN para los admins
    // Obtener todos los admins
    const [admins] = await pool.query('SELECT id_usuario FROM Usuario WHERE id_rol = 1');

    const [empresa] = await pool.query('SELECT nombre_empresa FROM Empresa WHERE id_empresa = ?', [
      id_empresa,
    ]);

    // Crear notificación para cada admin
    for (const admin of admins) {
      await pool.query('INSERT INTO Notificacion (id_usuario, mensaje, tipo) VALUES (?, ?, ?)', [
        admin.id_usuario,
        `Nueva vacante publicada por ${empresa[0].nombre_empresa}: "${datosVacante.titulo_cargo}". Requiere moderación.`,
        'INFO',
      ]);
    }

    res.status(201).json({
      id_vacante: result.insertId,
      message: 'Vacante creada, pendiente de aprobación',
    });
  } catch (error) {
    console.error('Error al crear vacante:', error);
    res.status(500).json({ error: 'Error al crear vacante' });
  }
};

// ==========================================
// 5. ELIMINAR VACANTE (EMPRESA)
// Nombre Corregido de deleteVacante a eliminarVacante
// ==========================================
export const eliminarVacante = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM Postulacion WHERE id_vacante = ?', [id]);
    const [result] = await pool.query('DELETE FROM Vacante WHERE id_vacante = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vacante no encontrada.' });
    }

    res.json({ mensaje: 'Vacante eliminada' });
  } catch (error) {
    console.error('Error al eliminar vacante:', error);
    res.status(500).json({ error: 'Error al eliminar' });
  }
};

// ==========================================
// 6. ACTUALIZAR VACANTE (EMPRESA)
// ==========================================
export const actualizarVacante = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params; // id de la vacante a editar
  const { titulo_cargo, descripcion_vacante, ubicacion, tipo_trabajo, salario_min, salario_max } =
    req.body;

  try {
    const [result] = await pool.query(
      `
      UPDATE Vacante SET
        titulo_cargo = ?, 
        descripcion_vacante = ?, 
        ubicacion = ?, 
        tipo_trabajo = ?, 
        salario_min = ?, 
        salario_max = ?,
        estado_aprobacion = 'PENDIENTE' 
      WHERE id_vacante = ?
    `,
      [titulo_cargo, descripcion_vacante, ubicacion, tipo_trabajo, salario_min, salario_max, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vacante no encontrada para actualizar.' });
    }

    res.json({ mensaje: 'Vacante actualizada correctamente (Enviada a revisión)' });
  } catch (error) {
    console.error('Error al actualizar vacante:', error);
    res.status(500).json({ error: 'Error al actualizar vacante' });
  }
};
