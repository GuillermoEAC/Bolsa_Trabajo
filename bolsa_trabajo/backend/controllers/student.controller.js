// backend/controllers/student.controller.js

// ============================================
// OBTENER PERFIL COMPLETO DEL ESTUDIANTE
// ============================================
export const getStudentProfile = async (req, res) => {
  // Verificación de seguridad: ¿Existe la conexión?
  const pool = req.app.locals.pool;
  if (!pool) {
    console.error('❌ ERROR GRAVE: "pool" no está definido en req.app.locals');
    return res
      .status(500)
      .json({ error: 'Error de configuración del servidor (Database pool missing)' });
  }

  const { id_usuario } = req.params;
  console.log('🔍 Buscando perfil para id_usuario:', id_usuario);

  try {
    // 1. Validar que el usuario existe en tabla Usuario
    const [usuarios] = await pool.query(
      'SELECT id_usuario, email, nombre_completo FROM Usuario WHERE id_usuario = ?',
      [id_usuario]
    );

    if (usuarios.length === 0) {
      console.log('❌ Usuario no encontrado:', id_usuario);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarios[0];

    // 2. Buscar si ya tiene perfil de Estudiante
    const [estudiantes] = await pool.query('SELECT * FROM Estudiante WHERE id_usuario = ?', [
      id_usuario,
    ]);

    let perfil;
    let id_estudiante;

    if (estudiantes.length === 0) {
      // ⚠️ NO EXISTE ESTUDIANTE → Crear perfil vacío automáticamente
      console.log('⚠️ Estudiante no existe, creando perfil base...');

      const nombreCompleto = usuario.nombre_completo || '';
      const partes = nombreCompleto.trim().split(' ');
      const nombre = partes[0] || '';
      const apellido = partes.slice(1).join(' ') || '';

      // INSERT SEGURO: Usamos '?' para todo y valores por defecto controlados
      const [result] = await pool.query(
        `INSERT INTO Estudiante 
        (id_usuario, nombre, apellido, titulo_cv, descripcion, ubicacion, telefono, disponibilidad_viajar, disponibilidad_residencia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_usuario,
          nombre,
          apellido,
          '', // titulo_cv
          '', // descripcion
          '', // ubicacion
          '', // telefono
          0, // disponibilidad_viajar (0 = false)
          0, // disponibilidad_residencia (0 = false)
        ]
      );

      id_estudiante = result.insertId;

      perfil = {
        id_estudiante,
        id_usuario,
        nombre,
        apellido,
        email: usuario.email,
        titulo_cv: '',
        descripcion: '',
        ubicacion: '',
        telefono: '',
        disponibilidad_viajar: false,
        disponibilidad_residencia: false,
      };

      console.log('✅ Perfil base creado con id_estudiante:', id_estudiante);
    } else {
      // ✅ YA EXISTE ESTUDIANTE
      perfil = { ...estudiantes[0], email: usuario.email };
      id_estudiante = perfil.id_estudiante;

      // Convertir 1/0 a true/false para el frontend si vienen como números
      perfil.disponibilidad_viajar = !!perfil.disponibilidad_viajar;
      perfil.disponibilidad_residencia = !!perfil.disponibilidad_residencia;

      console.log('✅ Perfil existente encontrado:', { id_estudiante, nombre: perfil.nombre });
    }

    // 3. Traer relaciones (Optimizada con Promise.all para velocidad)
    const [estudiosResults, experienciasResults, proyectosResults] = await Promise.all([
      pool.query(
        'SELECT * FROM Estudio WHERE id_estudiante = ? ORDER BY COALESCE(fecha_inicio, "9999-12-31") DESC',
        [id_estudiante]
      ),
      pool.query(
        'SELECT * FROM Experiencia_Laboral WHERE id_estudiante = ? ORDER BY COALESCE(fecha_inicio, "9999-12-31") DESC',
        [id_estudiante]
      ),
      pool.query(
        'SELECT * FROM Proyecto WHERE id_estudiante = ? ORDER BY COALESCE(fecha_inicio, "9999-12-31") DESC',
        [id_estudiante]
      ),
    ]);

    // Extraer las filas de los resultados [rows, fields]
    const estudios = estudiosResults[0];
    const experiencias = experienciasResults[0];
    const proyectos = proyectosResults[0];

    console.log(
      `📚 Datos: ${estudios.length} estudios, ${experiencias.length} experiencias, ${proyectos.length} proyectos.`
    );

    // 4. Respuesta completa
    const respuesta = {
      ...perfil,
      estudios: estudios || [],
      experiencias: experiencias || [],
      proyectos: proyectos || [],
      habilidades: [],
      idiomas: [],
    };

    res.json(respuesta);
  } catch (error) {
    console.error('❌ Error CRÍTICO en getStudentProfile:', error);
    // Enviamos el mensaje de error al frontend para facilitar depuración
    res.status(500).json({ error: 'Error al leer perfil', detalle: error.message });
  }
};

// ============================================
// GUARDAR/ACTUALIZAR PERFIL COMPLETO
// ============================================
export const saveStudentProfile = async (req, res) => {
  const pool = req.app.locals.pool;
  if (!pool) return res.status(500).json({ error: 'Database connection missing' });

  // Nota: Connection se usa para transacciones
  let connection;

  try {
    connection = await pool.getConnection(); // Obtener conexión para transacción

    const {
      id_usuario,
      nombre,
      apellido,
      titulo_cv,
      descripcion,
      ubicacion,
      telefono,
      disponibilidad_viajar,
      disponibilidad_residencia,
      estudios,
      experiencias,
      proyectos,
    } = req.body;

    console.log('💾 Guardando perfil para id_usuario:', id_usuario);

    if (!id_usuario || !nombre || !apellido) {
      connection.release(); // Liberar si hay error temprano
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    await connection.beginTransaction();

    // 1. Verificar/Crear Estudiante
    const [existente] = await connection.query(
      'SELECT id_estudiante FROM Estudiante WHERE id_usuario = ?',
      [id_usuario]
    );

    let id_estudiante;

    if (existente.length === 0) {
      console.log('➕ Creando nuevo estudiante (save)');
      const [result] = await connection.query(
        `INSERT INTO Estudiante 
        (id_usuario, nombre, apellido, titulo_cv, descripcion, ubicacion, telefono, disponibilidad_viajar, disponibilidad_residencia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_usuario,
          nombre,
          apellido,
          titulo_cv || '',
          descripcion || '',
          ubicacion || '',
          telefono || '',
          disponibilidad_viajar ? 1 : 0,
          disponibilidad_residencia ? 1 : 0,
        ]
      );
      id_estudiante = result.insertId;
    } else {
      console.log('🔄 Actualizando estudiante existente');
      id_estudiante = existente[0].id_estudiante;
      await connection.query(
        `UPDATE Estudiante SET 
        nombre=?, apellido=?, titulo_cv=?, descripcion=?, ubicacion=?, telefono=?, 
        disponibilidad_viajar=?, disponibilidad_residencia=?
        WHERE id_estudiante=?`,
        [
          nombre,
          apellido,
          titulo_cv,
          descripcion,
          ubicacion,
          telefono,
          disponibilidad_viajar ? 1 : 0,
          disponibilidad_residencia ? 1 : 0,
          id_estudiante,
        ]
      );
    }

    // 2. GUARDAR ESTUDIOS
    if (estudios && Array.isArray(estudios)) {
      await connection.query('DELETE FROM Estudio WHERE id_estudiante = ?', [id_estudiante]);
      for (const est of estudios) {
        if (est.carrera && est.centro_estudio) {
          await connection.query(
            `INSERT INTO Estudio 
            (id_estudiante, nivel_estudio, carrera, centro_estudio, fecha_inicio, fecha_fin, en_curso)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              id_estudiante,
              est.nivel_estudio || '',
              est.carrera,
              est.centro_estudio,
              est.fecha_inicio || null,
              est.fecha_fin || null,
              est.en_curso ? 1 : 0,
            ]
          );
        }
      }
    }

    // 3. GUARDAR EXPERIENCIAS
    if (experiencias && Array.isArray(experiencias)) {
      await connection.query('DELETE FROM Experiencia_Laboral WHERE id_estudiante = ?', [
        id_estudiante,
      ]);
      for (const exp of experiencias) {
        if (exp.titulo_puesto && exp.nombre_empresa) {
          await connection.query(
            `INSERT INTO Experiencia_Laboral 
            (id_estudiante, titulo_puesto, nombre_empresa, descripcion_tareas, fecha_inicio, fecha_fin, actualmente_trabajando)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              id_estudiante,
              exp.titulo_puesto,
              exp.nombre_empresa,
              exp.descripcion_tareas || '',
              exp.fecha_inicio || null,
              exp.fecha_fin || null,
              exp.actualmente_trabajando ? 1 : 0,
            ]
          );
        }
      }
    }

    // 4. GUARDAR PROYECTOS
    if (proyectos && Array.isArray(proyectos)) {
      await connection.query('DELETE FROM Proyecto WHERE id_estudiante = ?', [id_estudiante]);
      for (const proy of proyectos) {
        if (proy.nombre_proyecto) {
          await connection.query(
            `INSERT INTO Proyecto 
            (id_estudiante, nombre_proyecto, descripcion, tecnologias, url_proyecto, fecha_inicio, fecha_fin)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              id_estudiante,
              proy.nombre_proyecto,
              proy.descripcion || '',
              proy.tecnologias || '',
              proy.url_proyecto || '',
              proy.fecha_inicio || null,
              proy.fecha_fin || null,
            ]
          );
        }
      }
    }

    await connection.commit();
    console.log('✅ Perfil guardado exitosamente');
    res.json({ mensaje: 'Perfil guardado exitosamente', id_estudiante });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('❌ Error en saveStudentProfile:', error);
    res.status(500).json({ error: 'Error al guardar perfil', detalle: error.message });
  } finally {
    if (connection) connection.release();
  }
};
// ============================================
// SUBIR FOTO DE PERFIL
// ============================================
export const uploadProfilePhoto = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario } = req.body; // Enviamos el ID junto con la foto

  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }

  // Generamos la URL accesible desde el frontend
  // Nota: req.file.filename es el nombre con el que Multer guardó el archivo
  const photoUrl = `http://localhost:3000/uploads/${req.file.filename}`;

  console.log('📸 Subiendo foto para usuario:', id_usuario);
  console.log('📂 Archivo guardado en:', photoUrl);

  try {
    // Actualizamos la tabla Estudiante
    const [result] = await pool.query(
      'UPDATE Estudiante SET url_foto_perfil = ? WHERE id_usuario = ?',
      [photoUrl, id_usuario]
    );

    if (result.affectedRows === 0) {
      // Si no se actualizó nada, quizás el estudiante no existe aún
      return res
        .status(404)
        .json({ error: 'No se encontró el perfil del estudiante para actualizar.' });
    }

    res.json({ mensaje: 'Foto actualizada', url: photoUrl });
  } catch (error) {
    console.error('❌ Error al guardar foto:', error);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};
export const obtenerPerfilCompleto = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario } = req.params;

  try {
    const [estudiante] = await pool.query('SELECT * FROM Estudiante WHERE id_usuario = ?', [
      id_usuario,
    ]);

    if (estudiante.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    const id_estudiante = estudiante[0].id_estudiante;

    const [estudios] = await pool.query(
      'SELECT * FROM Estudio WHERE id_estudiante = ? ORDER BY fecha_inicio DESC',
      [id_estudiante]
    );

    const [experiencias] = await pool.query(
      'SELECT * FROM Experiencia_Laboral WHERE id_estudiante = ? ORDER BY fecha_inicio DESC',
      [id_estudiante]
    );

    const [proyectos] = await pool.query('SELECT * FROM Proyecto WHERE id_estudiante = ?', [
      id_estudiante,
    ]);

    res.json({
      ...estudiante[0],
      estudios,
      experiencias,
      proyectos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};
export const subirCV = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }

  const cvPath = `uploads/cvs/${req.file.filename}`;

  try {
    await pool.query('UPDATE Estudiante SET cv_path = ? WHERE id_usuario = ?', [
      cvPath,
      id_usuario,
    ]);

    res.json({
      mensaje: 'CV subido exitosamente',
      cv_path: cvPath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar CV' });
  }
};
