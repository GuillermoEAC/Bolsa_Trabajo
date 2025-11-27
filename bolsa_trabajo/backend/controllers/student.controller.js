// backend/controllers/student.controller.js

export const saveStudentProfile = async (req, res) => {
  const pool = req.app.locals.pool;
  const connection = await pool.getConnection(); // Conexión dedicada para transacción

  try {
    await connection.beginTransaction();

    const {
      id_usuario,
      nombre,
      apellido,
      telefono,
      titulo_cv,
      descripcion,
      disponibilidad_viajar,
      disponibilidad_residencia,
      estudios,
      experiencias,
      proyectos,
    } = req.body;

    // 1. Gestionar Estudiante (Crear o Actualizar)
    const [existing] = await connection.query(
      'SELECT id_estudiante FROM Estudiante WHERE id_usuario = ?',
      [id_usuario]
    );
    let id_estudiante;

    if (existing.length > 0) {
      id_estudiante = existing[0].id_estudiante;
      await connection.query(
        `UPDATE Estudiante SET nombre=?, apellido=?, telefono=?, titulo_cv=?, descripcion=?, disponibilidad_viajar=?, disponibilidad_residencia=? WHERE id_estudiante=?`,
        [
          nombre,
          apellido,
          telefono,
          titulo_cv,
          descripcion,
          disponibilidad_viajar,
          disponibilidad_residencia,
          id_estudiante,
        ]
      );
    } else {
      const [resEst] = await connection.query(
        `INSERT INTO Estudiante (id_usuario, nombre, apellido, telefono, titulo_cv, descripcion, disponibilidad_viajar, disponibilidad_residencia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_usuario,
          nombre,
          apellido,
          telefono,
          titulo_cv,
          descripcion,
          disponibilidad_viajar,
          disponibilidad_residencia,
        ]
      );
      id_estudiante = resEst.insertId;
    }

    // 2. Insertar Tablas Relacionadas (Borrando anteriores para evitar duplicados al editar)

    // Estudios
    await connection.query('DELETE FROM Estudio WHERE id_estudiante = ?', [id_estudiante]);
    if (estudios?.length > 0) {
      const values = estudios.map((e) => [
        id_estudiante,
        e.nivel_estudio,
        e.centro_estudio,
        e.carrera,
        e.fecha_inicio,
        e.fecha_fin,
        e.en_curso,
      ]);
      await connection.query(
        'INSERT INTO Estudio (id_estudiante, nivel_estudio, centro_estudio, carrera, fecha_inicio, fecha_fin, en_curso) VALUES ?',
        [values]
      );
    }

    // Experiencia
    await connection.query('DELETE FROM Experiencia_Laboral WHERE id_estudiante = ?', [
      id_estudiante,
    ]);
    if (experiencias?.length > 0) {
      const values = experiencias.map((e) => [
        id_estudiante,
        e.titulo_puesto,
        e.nombre_empresa,
        e.descripcion_tareas,
        e.fecha_inicio,
        e.fecha_fin,
        e.actualmente_trabajando,
      ]);
      await connection.query(
        'INSERT INTO Experiencia_Laboral (id_estudiante, titulo_puesto, nombre_empresa, descripcion_tareas, fecha_inicio, fecha_fin, actualmente_trabajando) VALUES ?',
        [values]
      );
    }

    // Proyectos (Universal)
    await connection.query('DELETE FROM Proyecto WHERE id_estudiante = ?', [id_estudiante]);
    if (proyectos?.length > 0) {
      const values = proyectos.map((p) => [
        id_estudiante,
        p.nombre_proyecto,
        p.descripcion,
        p.url_repositorio,
        p.url_demo,
      ]);
      await connection.query(
        'INSERT INTO Proyecto (id_estudiante, nombre_proyecto, descripcion, url_repositorio, url_demo) VALUES ?',
        [values]
      );
    }

    await connection.commit();
    res.json({ mensaje: 'Perfil guardado exitosamente', id_estudiante });
  } catch (error) {
    await connection.rollback();
    console.error('Error guardando perfil:', error);
    res.status(500).json({ error: 'Error al guardar perfil' });
  } finally {
    connection.release();
  }
};
