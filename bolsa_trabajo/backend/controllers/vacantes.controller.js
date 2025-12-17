// Backend/controlloer/vacantes.controller.js
import { crearNotificacionInterna } from './notificaciones.controller.js';

export const buscarVacantes = async (req, res) => {
  const pool = req.app.locals.pool;

  // Recibimos los filtros y el ID del usuario actual
  const { q, ubicacion, modalidad, tipoContrato, minSalario, maxSalario, fecha, id_usuario } =
    req.query;

  try {
    let sql = `
      SELECT 
        v.*, 
        e.nombre_empresa, 
        e.logo_path, 
        c.nombre_categoria,
        /* SUB-CONSULTA: Devuelve 1 si es favorito de ESTE usuario, 0 si no */
        (SELECT COUNT(*) FROM Favorito f 
         JOIN Estudiante est ON f.id_estudiante = est.id_estudiante
         WHERE f.id_vacante = v.id_vacante 
         AND est.id_usuario = ?) as es_favorito
      FROM Vacante v
      INNER JOIN Empresa e ON v.id_empresa = e.id_empresa
      LEFT JOIN Categoria c ON v.id_categoria = c.id_categoria
      WHERE v.estado_aprobacion = 'APROBADA' 
      AND e.validada = 1
    `;

    // El primer parámetro es el id_usuario (o null si no hay login)
    // Si pasas null, la subconsulta da 0, así que nadie lo ve como favorito (correcto)
    const params = [id_usuario || null];

    // --- APLICACIÓN DE FILTROS ---
    if (q && q.trim() !== '') {
      sql += ` AND (v.titulo_cargo LIKE ? OR v.descripcion_vacante LIKE ? OR e.nombre_empresa LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (ubicacion) {
      sql += ` AND v.ubicacion LIKE ?`;
      params.push(`%${ubicacion}%`);
    }

    if (modalidad) {
      sql += ` AND v.tipo_trabajo = ?`;
      params.push(modalidad);
    }

    if (tipoContrato) {
      sql += ` AND v.tipo_contrato = ?`;
      params.push(tipoContrato);
    }

    if (minSalario) {
      sql += ` AND v.salario_max >= ?`;
      params.push(parseInt(minSalario));
    }

    if (maxSalario) {
      sql += ` AND v.salario_min <= ?`;
      params.push(parseInt(maxSalario));
    }

    // Filtro de fecha (Opcional, según tu lógica anterior)
    if (fecha) {
      const hoy = new Date();
      if (fecha === 'hoy') {
        sql += ` AND v.fecha_publicacion >= DATE_SUB(NOW(), INTERVAL 1 DAY)`;
      } else if (fecha === 'semana') {
        sql += ` AND v.fecha_publicacion >= DATE_SUB(NOW(), INTERVAL 1 WEEK)`;
      } else if (fecha === 'mes') {
        sql += ` AND v.fecha_publicacion >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`;
      }
    }

    sql += ` ORDER BY v.fecha_publicacion DESC`;

    const [rows] = await pool.query(sql, params);

    // Convertimos el 1 o 0 de SQL a true/false para que Angular lo entienda fácil
    const vacantes = rows.map((v) => ({
      ...v,
      es_favorito: v.es_favorito > 0,
    }));

    res.json(vacantes);
  } catch (error) {
    console.error('❌ Error al buscar vacantes:', error);
    res.status(500).json({ error: 'Error al buscar vacantes' });
  }
};

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
      id_categoria,
    } = req.body;

    const [empresas] = await pool.query(
      'SELECT id_empresa, validada FROM Empresa WHERE id_usuario = ?',
      [id_usuario]
    );

    if (empresas.length === 0) return res.status(404).json({ error: 'No eres empresa.' });

    const [result] = await pool.query(
      `INSERT INTO Vacante (
        id_empresa, 
        id_categoria, 
        titulo_cargo,        
        descripcion_vacante, 
        ubicacion, 
        tipo_trabajo,       
        tipo_contrato,       
        salario_min, 
        salario_max, 
        estado_activa, 
        estado_aprobacion, 
        fecha_publicacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'PENDIENTE', NOW())`,
      [
        empresas[0].id_empresa,
        id_categoria || null,
        titulo,
        descripcion,
        ubicacion,
        modalidad,
        tipo_contrato,
        salario_min || 0,
        salario_max || 0,
      ]
    );

    res.status(201).json({ mensaje: 'Vacante creada', id_vacante: result.insertId });
  } catch (error) {
    console.error('Error al crear vacante:', error);
    res.status(500).json({ error: 'Error al crear vacante.' });
  }
};

export const actualizarVacante = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;

  // Recibimos nombres cortos del Frontend
  const {
    titulo,
    descripcion,
    ubicacion,
    modalidad,
    tipo_contrato,
    salario_min,
    salario_max,
    id_categoria,
  } = req.body;

  try {
    // Mapeamos a los nombres de la Base de Datos
    const [result] = await pool.query(
      `UPDATE Vacante SET
        titulo_cargo = ?, 
        descripcion_vacante = ?, 
        ubicacion = ?, 
        tipo_trabajo = ?, 
        tipo_contrato = ?,
        salario_min = ?, 
        salario_max = ?,
        id_categoria = ?,
        estado_aprobacion = 'PENDIENTE' 
      WHERE id_vacante = ?`,
      [
        titulo,
        descripcion,
        ubicacion,
        modalidad,
        tipo_contrato,
        salario_min,
        salario_max,
        id_categoria,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vacante no encontrada.' });
    }

    res.json({ mensaje: 'Vacante actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar:', error);
    res.status(500).json({ error: 'Error al actualizar vacante' });
  }
};

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

export const obtenerCategorias = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    // Pedimos todas las categorías ordenadas alfabéticamente
    const [rows] = await pool.query('SELECT * FROM Categoria ORDER BY nombre_categoria ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al cargar categorías' });
  }
};
