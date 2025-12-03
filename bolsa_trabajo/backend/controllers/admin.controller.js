// ==========================================
// Funciones de utilidad para el resumen de usuarios (asumiendo lógica simple)

import e from 'express';

// ==========================================
const calcularResumenUsuarios = (usuarios) => {
  let estudiantes = 0;
  let empresas = 0;

  usuarios.forEach((u) => {
    // Aceptamos tanto ESTUDIANTE/EMPRESA en mayúscula como minúscula para robustez
    if (u.tipo_usuario === 'ESTUDIANTE' || u.tipo_usuario === 'estudiante') {
      estudiantes++;
    } else if (u.tipo_usuario === 'EMPRESA' || u.tipo_usuario === 'empresa') {
      empresas++;
    }
  });

  return {
    total: usuarios.length,
    estudiantes: estudiantes,
    empresas: empresas,
  };
};

// ==========================================
// ========== EMPRESAS ==========
// ==========================================

export const obtenerEmpresas = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.query(
      `
      SELECT e.id_empresa, e.nombre_empresa, e.razon_social, e.email_contacto, e.sector, e.validada, u.email as email_usuario
      FROM Empresa e
      JOIN Usuario u ON e.id_usuario = u.id_usuario
      ORDER BY e.validada ASC, e.id_empresa DESC
    `
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    res.status(500).json({ error: 'Error al obtener lista de empresas' });
  }
};

export const cambiarEstadoEmpresa = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { validada } = req.body; // true (1) o false (0)

  try {
    // Obtener datos de la empresa
    const [empresa] = await pool.query(
      `
      SELECT e.nombre_empresa, u.id_usuario, u.email
      FROM Empresa e
      JOIN Usuario u ON e.id_usuario = u.id_usuario
      WHERE e.id_empresa = ?
    `,
      [id]
    );

    if (empresa.length === 0) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    // Actualizar estado
    await pool.query('UPDATE Empresa SET validada = ? WHERE id_empresa = ?', [
      validada ? 1 : 0,
      id,
    ]);

    // 🔥 CREAR NOTIFICACIÓN para la empresa
    const mensaje = validada
      ? `¡Bienvenido! Tu cuenta de ${empresa[0].nombre_empresa} ha sido validada. Ya puedes publicar vacantes.`
      : `Tu cuenta de ${empresa[0].nombre_empresa} fue desactivada por el administrador.`;

    const tipo = validada ? 'EXITO' : 'ADVERTENCIA';

    await pool.query('INSERT INTO Notificacion (id_usuario, mensaje, tipo) VALUES (?, ?, ?)', [
      empresa[0].id_usuario,
      mensaje,
      tipo,
    ]);

    res.json({ message: 'Estado de empresa actualizado' });
  } catch (error) {
    console.error('Error al cambiar estado de empresa:', error);
    res.status(500).json({ error: 'Error al cambiar estado de empresa' });
  }
};

// ==========================================
// ========== VACANTES ==========
// ==========================================

export const obtenerVacantesAdmin = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [vacantes] = await pool.query(`
      SELECT v.*, e.nombre_empresa 
      FROM Vacante v
      JOIN Empresa e ON v.id_empresa = e.id_empresa
      ORDER BY FIELD(v.estado_aprobacion, 'PENDIENTE', 'APROBADA', 'RECHAZADA'), v.fecha_publicacion DESC
    `);

    console.log('📊 Vacantes encontradas:', vacantes.length); // 🔥 Debug
    res.json(vacantes);
  } catch (error) {
    console.error('❌ Error al obtener vacantes (admin):', error);
    res.status(500).json({ error: 'Error al obtener vacantes' });
  }
};

export const moderarVacante = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { accion, motivo_rechazo } = req.body; // 'aprobar' o 'rechazar'
  const id_administrador = req.usuario.id_usuario;

  try {
    const estado = accion === 'aprobar' ? 'APROBADA' : 'RECHAZADA';

    // Obtener datos de la vacante
    const [vacante] = await pool.query(
      `
      SELECT v.titulo_cargo, e.id_usuario, e.nombre_empresa
      FROM Vacante v
      JOIN Empresa e ON v.id_empresa = e.id_empresa
      WHERE v.id_vacante = ?
    `,
      [id]
    );

    if (vacante.length === 0) {
      return res.status(404).json({ error: 'Vacante no encontrada' });
    }

    // Actualizar estado
    await pool.query(
      'UPDATE Vacante SET estado_aprobacion = ?, motivo_rechazo = ?, id_administrador_aprobador = ? WHERE id_vacante = ?',
      [estado, motivo_rechazo || null, id_administrador, id]
    );

    // 🔥 CREAR NOTIFICACIÓN para la empresa
    const mensaje =
      estado === 'APROBADA'
        ? `¡Excelente! Tu vacante "${vacante[0].titulo_cargo}" ha sido aprobada y ahora está visible para los estudiantes.`
        : `Tu vacante "${vacante[0].titulo_cargo}" fue rechazada. Motivo: ${
            motivo_rechazo || 'No especificado'
          }`;

    const tipo = estado === 'APROBADA' ? 'EXITO' : 'ADVERTENCIA';

    await pool.query('INSERT INTO Notificacion (id_usuario, mensaje, tipo) VALUES (?, ?, ?)', [
      vacante[0].id_usuario,
      mensaje,
      tipo,
    ]);

    res.json({ message: `Vacante ${estado.toLowerCase()} correctamente` });
  } catch (error) {
    console.error('Error al moderar vacante:', error);
    res.status(500).json({ error: 'Error al moderar vacante' });
  }
};

export const eliminarVacanteAdmin = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params; // id_vacante
  try {
    // Si tienes ON DELETE CASCADE configurado, solo necesitas borrar la vacante
    // Si no tienes CASCADE, debes borrar postulaciones primero:
    await pool.query('DELETE FROM Postulacion WHERE id_vacante = ?', [id]);
    const [result] = await pool.query('DELETE FROM Vacante WHERE id_vacante = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Vacante no encontrada.' });
    }

    res.json({ mensaje: `Vacante ${id} y postulaciones asociadas eliminadas.` });
  } catch (error) {
    console.error('Error al eliminar vacante (admin):', error);
    res.status(500).json({ error: 'Error interno al eliminar vacante' });
  }
};

// ==========================================
// ========== USUARIOS ==========
// ==========================================

export const obtenerUsuarios = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    // Obtener Estudiantes (Rol 2) y Empresas (Rol 3)
    const [usuariosDB] = await pool.query(
      `
      SELECT u.id_usuario AS id, u.email, r.nombre_rol AS tipo_usuario, NULL AS nombre, NULL AS apellido, NULL AS telefono, u.fecha_registro
      FROM Usuario u
      JOIN Rol r ON u.id_rol = r.id_rol
      WHERE r.nombre_rol IN ('Estudiante', 'Empresa') 
      ORDER BY u.fecha_registro DESC
    `
    );

    // Mapear datos de perfiles específicos a la lista principal (LÓGICA SIMPLIFICADA)
    // En una aplicación real, se usarían LEFT JOINs más complejos
    // Aquí, simulamos el mapeo que esperas en tu frontend
    const usuarios = usuariosDB.map((user) => ({
      ...user,
      // Simulando campos de perfil: En un entorno real, estos vendrían de JOINs
      nombre: user.tipo_usuario === 'Estudiante' ? 'Estudiante Test' : 'Empresa Test',
      apellido: user.tipo_usuario === 'Estudiante' ? 'Apellido Test' : null,
      fecha_nacimiento: user.tipo_usuario === 'Estudiante' ? '2000-01-01' : null,
    }));

    res.json({
      usuarios: usuarios,
      resumen: calcularResumenUsuarios(usuarios),
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener lista de usuarios' });
  }
};

export const eliminarUsuario = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id, tipo } = req.params; // id_usuario y tipo ('ESTUDIANTE' o 'EMPRESA')

  try {
    // 1. Obtener el ID del perfil específico (Estudiante o Empresa)
    let profileTable;
    let profileIdCol;

    if (tipo.toUpperCase() === 'ESTUDIANTE') {
      profileTable = 'Estudiante';
      profileIdCol = 'id_estudiante';
    } else if (tipo.toUpperCase() === 'EMPRESA') {
      profileTable = 'Empresa';
      profileIdCol = 'id_empresa';
    } else {
      return res.status(400).json({ error: 'Tipo de usuario no válido.' });
    }

    const [profileResult] = await pool.query(
      `SELECT ${profileIdCol} FROM ${profileTable} WHERE id_usuario = ?`,
      [id]
    );

    if (profileResult.length === 0) {
      return res.status(404).json({ mensaje: 'Perfil de usuario no encontrado.' });
    }

    // 2. Eliminar el perfil (La eliminación del Usuario, que tiene Notificaciones, Experiencia, etc. en CASCADE debe ser el último paso)
    await pool.query(`DELETE FROM ${profileTable} WHERE id_usuario = ?`, [id]);

    // 3. Eliminar el Usuario (Esto debería limpiar el resto de las tablas dependientes: Postulacion, Notificacion, Favorito, etc. si el CASCADE está configurado)
    const [result] = await pool.query('DELETE FROM Usuario WHERE id_usuario = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    res.json({ mensaje: `Usuario (ID: ${id}, Tipo: ${tipo}) y sus datos asociados eliminados.` });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno al eliminar el usuario' });
  }
};

export const obtenerEstadisticas = async (req, res) => {
  // Simulacro de función, ya que el dashboard no la estaba usando aún
  res.json({ mensaje: 'Estadísticas de alto nivel listadas aquí.' });
};
