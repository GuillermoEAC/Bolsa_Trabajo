// backend/controllers/jobs.controller.js
// Lógica para Publicar, Buscar y Postular Vacantes

// Importamos pool de la base de datos (se obtiene de req.app.locals en Server.js)
// IMPORTANTE: Asegúrate de que esta línea es correcta en tu setup si usas app.locals
// Si usas app.locals, elimina esta línea y usa 'const pool = req.app.locals.pool;' dentro de cada función.

/**
 * Publicar una nueva oferta de trabajo. (RF: Empresas deben poder publicar ofertas)
 * Requiere título, empresa, salario, descripción, ubicación.
 */
export const createJob = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { id_empresa, titulo, salario, descripcion, ubicacion, modalidad, tipo_contrato } =
      req.body;

    if (!id_empresa || !titulo || !descripcion) {
      return res
        .status(400)
        .json({ error: 'Faltan campos obligatorios (Empresa, Título, Descripción).' });
    }

    // Por defecto, una vacante se crea en estado 'Pendiente' (estado 0) para ser aprobada por el Admin.
    const [result] = await pool.query(
      'INSERT INTO Vacante (id_empresa, titulo, salario, descripcion, ubicacion, modalidad, tipo_contrato, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
      [id_empresa, titulo, salario, descripcion, ubicacion, modalidad, tipo_contrato]
    );

    res.status(201).json({
      mensaje: 'Oferta creada con éxito. Pendiente de aprobación del Administrador.',
      id_vacante: result.insertId,
    });
  } catch (error) {
    console.error('Error al crear oferta:', error);
    res.status(500).json({ error: 'Error del servidor al crear la oferta.' });
  }
};

/**
 * Buscar y listar vacantes. (RF: Búsqueda por títulos, empresa, salario, ubicación, etc.)
 * Implementación simplificada para demostrar la estructura. La búsqueda real requiere lógica de filtros compleja.
 */
export const searchJobs = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { q, ubicacion, modalidad, salario_min, ordenar_por = 'fecha' } = req.query;

    let sql = 'SELECT * FROM Vacante WHERE estado = 1'; // Solo ofertas APROBADAS
    let params = [];

    // Lógica simple de filtros
    if (q) {
      sql += ' AND (titulo LIKE ? OR descripcion LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }
    if (ubicacion) {
      sql += ' AND ubicacion = ?';
      params.push(ubicacion);
    }

    // Lógica de ordenamiento (RF: Ordenar por fecha, salario o relevancia)
    if (ordenar_por === 'salario') {
      sql += ' ORDER BY salario DESC';
    } else if (ordenar_por === 'relevancia') {
      sql += ' ORDER BY titulo'; // Simulación simple de relevancia
    } else {
      // default: fecha
      sql += ' ORDER BY fecha_publicacion DESC';
    }

    const [results] = await pool.query(sql, params);
    res.json(results);
  } catch (error) {
    console.error('Error al buscar ofertas:', error);
    res.status(500).json({ error: 'Error del servidor al realizar la búsqueda.' });
  }
};

/**
 * Postularse a una vacante. (RF: Los usuarios podrán postularse a una vacante con un clic)
 */
export const applyToJob = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { id_usuario, id_vacante } = req.body;

    if (!id_usuario || !id_vacante) {
      return res.status(400).json({ error: 'Se requiere ID de usuario y ID de vacante.' });
    }

    // 1. Insertar la postulación.
    const [result] = await pool.query(
      'INSERT INTO Postulacion (id_usuario, id_vacante, fecha_postulacion, estado) VALUES (?, ?, NOW(), ?)',
      [id_usuario, id_vacante, 'Pendiente']
    );

    // 2. (Simular notificación a la empresa - RF: Las empresas deben recibir notificaciones)
    console.log(`[NOTIFICACIÓN] Usuario ${id_usuario} se postuló a la vacante ${id_vacante}.`);

    res.status(201).json({
      mensaje: 'Postulación enviada con éxito.',
      id_postulacion: result.insertId,
    });
  } catch (error) {
    console.error('Error al postular:', error);
    res.status(500).json({ error: 'Error del servidor al postularse a la vacante.' });
  }
};
