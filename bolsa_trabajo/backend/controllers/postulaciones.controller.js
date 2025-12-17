// backend/controllers/postulaciones.controller.js
import { crearNotificacionInterna } from './notificaciones.controller.js';

// ============================================
// 1. REGISTRAR POSTULACIÓN (Aquí estaba el error)
// ============================================
export const registrarPostulacion = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario, id_vacante } = req.body;

  try {
    // 1. Validar Estudiante
    const [est] = await pool.query(
      'SELECT id_estudiante, nombre, apellido FROM Estudiante WHERE id_usuario = ?',
      [id_usuario]
    );
    if (est.length === 0)
      return res.status(403).json({ error: 'Solo los estudiantes pueden postularse.' });
    const estudiante = est[0];

    // 2. Validar si ya existe la postulación
    const [exist] = await pool.query(
      'SELECT * FROM Postulacion WHERE id_estudiante = ? AND id_vacante = ?',
      [estudiante.id_estudiante, id_vacante]
    );
    if (exist.length > 0)
      return res.status(400).json({ error: 'Ya te has postulado a esta vacante.' });

    // 3. Insertar Postulación (ESTO SÍ FUNCIONA)
    await pool.query(
      'INSERT INTO Postulacion (id_estudiante, id_vacante, fecha_postulacion, estado_postulacion) VALUES (?, ?, NOW(), "Postulado")',
      [estudiante.id_estudiante, id_vacante]
    );

    // =================================================================
    // 🔥 ZONA DE SEGURIDAD PARA NOTIFICACIONES
    // Si esto falla, NO queremos que le salga error al usuario
    // =================================================================
    try {
      const [vacanteInfo] = await pool.query(
        `
            SELECT e.id_usuario, v.titulo_cargo 
            FROM Vacante v 
            JOIN Empresa e ON v.id_empresa = e.id_empresa 
            WHERE v.id_vacante = ?
          `,
        [id_vacante]
      );

      if (vacanteInfo.length > 0) {
        const { id_usuario: idEmpresa, titulo_cargo } = vacanteInfo[0];
        const mensaje = `📢 Nuevo candidato: ${estudiante.nombre} ${estudiante.apellido} para "${titulo_cargo}".`;

        // Intentamos enviar la notificación
        // Si 'crearNotificacionInterna' no existe o falla, saltará al catch de abajo
        if (typeof crearNotificacionInterna === 'function') {
          await crearNotificacionInterna(pool, idEmpresa, mensaje, 'INFO');
        } else {
          console.warn('⚠️ La función crearNotificacionInterna no está disponible.');
        }
      }
    } catch (notiError) {
      // Solo imprimimos el error en la terminal del backend, pero NO detenemos la respuesta
      console.error('⚠️ La postulación se guardó, pero falló la notificación:', notiError.message);
    }
    // =================================================================

    // 4. Responder Éxito (Ahora siempre llegará aquí)
    res.status(201).json({ mensaje: 'Postulado con éxito' });
  } catch (e) {
    console.error('❌ Error crítico en registrarPostulacion:', e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// 2. OBTENER MIS POSTULACIONES
// ============================================
export const obtenerMisPostulaciones = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario } = req.params;
  try {
    const [rows] = await pool.query(
      `
        SELECT p.*, v.titulo_cargo, v.ubicacion, e.nombre_empresa, e.logo_path, v.salario_min, v.salario_max
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

// ============================================
// 3. OBTENER CANDIDATOS POR VACANTE (EMPRESA)
// ============================================
export const obtenerCandidatosPorVacante = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_vacante } = req.params;
  try {
    const [candidatos] = await pool.query(
      `
        SELECT 
          p.id_postulacion, 
          p.fecha_postulacion, 
          p.estado_postulacion,
          e.id_estudiante, 
          e.id_usuario,  /* 👈 ¡ESTE FALTABA! Sin esto, el frontend recibe 'undefined' */
          e.nombre, 
          e.apellido, 
          e.titulo_cv, 
          e.telefono, 
          e.descripcion, 
          e.url_foto_perfil,
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

// ============================================
// 4. CAMBIAR ESTADO POSTULACIÓN
// ============================================
export const cambiarEstadoPostulacion = async (req, res) => {
  const pool = req.app.locals.pool;

  const { id_postulacion } = req.params;

  const { nuevo_estado } = req.body;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        p.id_postulacion, 
        v.titulo_cargo, 
        e.nombre_empresa, 
        st.id_usuario 
      FROM Postulacion p
      INNER JOIN Vacante v ON p.id_vacante = v.id_vacante
      INNER JOIN Empresa e ON v.id_empresa = e.id_empresa
      INNER JOIN Estudiante st ON p.id_estudiante = st.id_estudiante
      WHERE p.id_postulacion = ?
      `,
      [id_postulacion]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'La postulación no existe.' });
    }

    const info = rows[0];

    await pool.query('UPDATE Postulacion SET estado_postulacion = ? WHERE id_postulacion = ?', [
      nuevo_estado,
      id_postulacion,
    ]);

    let mensaje = `El estado de tu postulación para ${info.titulo_cargo} ha cambiado a: ${nuevo_estado}.`;
    let tipo = 'INFO';

    if (nuevo_estado === 'Visto') {
      mensaje = `Tu postulación para ${info.titulo_cargo} en ${info.nombre_empresa} ha sido vista.`;
    } else if (nuevo_estado === 'Entrevista') {
      mensaje = `¡Felicidades! ${info.nombre_empresa} quiere una entrevista para el puesto ${info.titulo_cargo}.`;
      tipo = 'EXITO';
    } else if (nuevo_estado === 'Rechazado') {
      mensaje = `Gracias por tu interés, pero tu proceso para ${info.titulo_cargo} ha finalizado.`;
    }

    await pool.query(
      'INSERT INTO Notificacion (id_usuario, mensaje, tipo, fecha_creacion) VALUES (?, ?, ?, NOW())',
      [info.id_usuario, mensaje, tipo]
    );

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al cambiar estado:', error);
    res.status(500).json({ error: 'Error interno al actualizar el estado.' });
  }
};
export const postularse = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_vacante } = req.params;
  const { id_usuario, carta_presentacion } = req.body;

  try {
    // Verificar si ya se postuló
    const [existente] = await pool.query(
      'SELECT * FROM Postulacion WHERE id_usuario = ? AND id_vacante = ?',
      [id_usuario, id_vacante]
    );

    if (existente.length > 0) {
      return res.status(400).json({ error: 'Ya te postulaste a esta vacante' });
    }

    // Crear postulación
    await pool.query(
      'INSERT INTO Postulacion (id_usuario, id_vacante, carta_presentacion) VALUES (?, ?, ?)',
      [id_usuario, id_vacante, carta_presentacion]
    );

    // Obtener datos de la vacante y empresa
    const [vacante] = await pool.query(
      `
        SELECT v.titulo_cargo, v.id_empresa, e.id_usuario as id_empresa_usuario, u.nombre
        FROM Vacante v
        JOIN Empresa e ON v.id_empresa = e.id_empresa
        JOIN Usuario u ON e.id_usuario = u.id_usuario
        WHERE v.id_vacante = ?
      `,
      [id_vacante]
    );

    // 🔥 CREAR NOTIFICACIÓN para la empresa
    const [estudiante] = await pool.query('SELECT nombre FROM Usuario WHERE id_usuario = ?', [
      id_usuario,
    ]);

    await pool.query('INSERT INTO Notificacion (id_usuario, mensaje, tipo) VALUES (?, ?, ?)', [
      vacante[0].id_empresa_usuario,
      `${estudiante[0].nombre} se postuló para ${vacante[0].titulo_cargo}`,
      'INFO',
    ]);

    res.status(201).json({ message: 'Postulación enviada con éxito' });
  } catch (error) {
    console.error('Error al postularse:', error);
    res.status(500).json({ error: 'Error al postularse' });
  }
};
