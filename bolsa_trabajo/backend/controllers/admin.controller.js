// Backend/controllers/Admin.controller.js

import e from 'express';
import { pool } from '../config/database.js';
// ==========================================
const calcularResumenUsuarios = (usuarios) => {
  let estudiantes = 0;
  let empresas = 0;

  usuarios.forEach((u) => {
    if (u.tipo_usuario === 'Estudiante' || u.tipo_usuario === 'ESTUDIANTE') {
      estudiantes++;
    } else if (u.tipo_usuario === 'Empresa' || u.tipo_usuario === 'EMPRESA') {
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
  try {
    const [rows] = await pool.query(
      `
      SELECT e.id_empresa, e.nombre_empresa, e.razon_social, e.email_contacto, e.sector, e.validada, u.email as email_usuario, e.id_usuario
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
  const { id } = req.params;
  const { validada } = req.body; // true (1) o false (0)

  try {
    const [empresa] = await pool.query(
      `SELECT e.nombre_empresa, u.id_usuario, u.email FROM Empresa e JOIN Usuario u ON e.id_usuario = u.id_usuario WHERE e.id_empresa = ?`,
      [id]
    );

    if (empresa.length === 0) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    await pool.query('UPDATE Empresa SET validada = ? WHERE id_empresa = ?', [
      validada ? 1 : 0,
      id,
    ]);

    // Notificación
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
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: 'Error al cambiar estado de empresa' });
  }
};

// ==========================================
// ========== VACANTES ==========
// ==========================================

export const obtenerVacantesAdmin = async (req, res) => {
  try {
    const [vacantes] = await pool.query(`
      SELECT v.*, e.nombre_empresa 
      FROM Vacante v
      JOIN Empresa e ON v.id_empresa = e.id_empresa
      ORDER BY FIELD(v.estado_aprobacion, 'PENDIENTE', 'APROBADA', 'RECHAZADA'), v.fecha_publicacion DESC
    `);
    res.json(vacantes);
  } catch (error) {
    console.error('Error vacantes admin:', error);
    res.status(500).json({ error: 'Error al obtener vacantes' });
  }
};

export const moderarVacante = async (req, res) => {
  const { id } = req.params;
  const { accion, motivo_rechazo } = req.body;

  const id_administrador = req.usuario ? req.usuario.id_usuario : null;

  try {
    const estado = accion === 'aprobar' ? 'APROBADA' : 'RECHAZADA';

    const [vacante] = await pool.query(
      `SELECT v.titulo_cargo, e.id_usuario FROM Vacante v JOIN Empresa e ON v.id_empresa = e.id_empresa WHERE v.id_vacante = ?`,
      [id]
    );

    if (vacante.length === 0) return res.status(404).json({ error: 'Vacante no encontrada' });

    await pool.query(
      'UPDATE Vacante SET estado_aprobacion = ?, motivo_rechazo = ?, id_administrador_aprobador = ? WHERE id_vacante = ?',
      [estado, motivo_rechazo || null, id_administrador, id]
    );

    // Notificación
    const mensaje =
      estado === 'APROBADA'
        ? `¡Excelente! Tu vacante "${vacante[0].titulo_cargo}" ha sido aprobada.`
        : `Tu vacante "${vacante[0].titulo_cargo}" fue rechazada. Motivo: ${
            motivo_rechazo || 'No especificado'
          }`;

    const tipo = estado === 'APROBADA' ? 'EXITO' : 'ADVERTENCIA';

    await pool.query('INSERT INTO Notificacion (id_usuario, mensaje, tipo) VALUES (?, ?, ?)', [
      vacante[0].id_usuario,
      mensaje,
      tipo,
    ]);

    res.json({ message: `Vacante ${estado.toLowerCase()}` });
  } catch (error) {
    console.error('Error moderar vacante:', error);
    res.status(500).json({ error: 'Error al moderar vacante' });
  }
};

export const eliminarVacanteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Postulacion WHERE id_vacante = ?', [id]);
    const [result] = await pool.query('DELETE FROM Vacante WHERE id_vacante = ?', [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ mensaje: 'Vacante no encontrada.' });
    res.json({ mensaje: 'Vacante eliminada.' });
  } catch (error) {
    console.error('Error eliminar vacante:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};

// ==========================================
// ========== USUARIOS ==========
// ==========================================

export const obtenerUsuarios = async (req, res) => {
  try {
    const [usuarios] = await pool.query(`
      SELECT 
        u.id_usuario as id, 
        u.email, 
        r.nombre_rol as tipo_usuario, 
        u.fecha_registro,
        -- Datos de Estudiante
        est.nombre, 
        est.apellido, 
        est.fecha_nacimiento,
        est.telefono,
        -- Datos de Empresa (si es empresa, usamos nombre_empresa como nombre)
        emp.nombre_empresa
      FROM Usuario u
      JOIN Rol r ON u.id_rol = r.id_rol
      LEFT JOIN Estudiante est ON u.id_usuario = est.id_usuario
      LEFT JOIN Empresa emp ON u.id_usuario = emp.id_usuario
      WHERE r.nombre_rol IN ('Estudiante', 'Empresa')
      ORDER BY u.fecha_registro DESC
    `);

    // Formateamos los datos para que el frontend los reciba limpios
    const usuariosFormateados = usuarios.map((u) => ({
      id: u.id,
      email: u.email,
      tipo_usuario: u.tipo_usuario.toUpperCase(),
      fecha_registro: u.fecha_registro,

      nombre: u.tipo_usuario === 'Empresa' ? u.nombre_empresa : u.nombre,
      apellido: u.apellido,
      telefono: u.telefono,
      fecha_nacimiento: u.fecha_nacimiento,
    }));

    res.json({
      usuarios: usuariosFormateados,
      resumen: calcularResumenUsuarios(usuariosFormateados),
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener lista de usuarios' });
  }
};

export const eliminarUsuario = async (req, res) => {
  const { id, tipo } = req.params;

  try {
    let profileTable = tipo.toUpperCase() === 'ESTUDIANTE' ? 'Estudiante' : 'Empresa';

    await pool.query(`DELETE FROM ${profileTable} WHERE id_usuario = ?`, [id]);

    const [result] = await pool.query('DELETE FROM Usuario WHERE id_usuario = ?', [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

    res.json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno al eliminar usuario' });
  }
};

export const obtenerEstadisticas = async (req, res) => {
  res.json({ mensaje: 'Estadísticas placeholder' });
};
