// Backend/controlls/company.controller.js
import bcrypt from 'bcrypt';
import { crearNotificacionInterna } from './notificaciones.controller.js';

export const registerCompany = async (req, res) => {
  const pool = req.app.locals.pool;
  const connection = await pool.getConnection();

  try {
    console.log('--- INTENTO DE REGISTRO ---');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const {
      email,
      password,
      nombre_empresa,
      razon_social,
      nit,
      email_contacto,
      sitio_web,
      descripcion,
    } = req.body;

    if (!password || !email) {
      connection.release(); // Importante liberar conexión antes de salir
      return res.status(400).json({
        message: 'Faltan datos obligatorios: Email o Contraseña no recibidos.',
      });
    }
    const logoPath = req.file ? `uploads/logos/${req.file.filename}` : null;

    const [exists] = await connection.query('SELECT id_usuario FROM Usuario WHERE email = ?', [
      email,
    ]);
    if (exists.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [resUser] = await connection.query(
      'INSERT INTO Usuario (email, contraseña, id_rol) VALUES (?, ?, 3)',
      [email, hash]
    );
    const newUserId = resUser.insertId;

    await connection.query(
      `INSERT INTO Empresa 
      (id_usuario, nombre_empresa, razon_social, nit, email_contacto, sitio_web, descripcion, logo_path, validada) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        newUserId,
        nombre_empresa,
        razon_social,
        nit,
        email_contacto || email,
        sitio_web,
        descripcion,
        logoPath,
      ]
    );

    await connection.commit();

    try {
      const mensajeBienvenida =
        '¡Bienvenido! 🏢 Tu cuenta de empresa ha sido creada. Un administrador validará tus datos pronto para que puedas publicar vacantes.';
      // 'exito' coincide con tu ENUM
      await crearNotificacionInterna(pool, newUserId, mensajeBienvenida, 'exito');
    } catch (notifError) {
      console.error('Error al enviar notificación de bienvenida empresa:', notifError);
      // No fallamos el registro si la notificación falla, solo lo logueamos
    }

    res
      .status(201)
      .json({ mensaje: 'Empresa registrada. Pendiente de validación.', logo: logoPath });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error registro empresa:', error);

    await connection.rollback();
    console.error('Error registro empresa:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  } finally {
    connection.release();
  }
};

// ==========================================
// NUEVO: Verificar estado de validación
// ==========================================
export const obtenerEstadoEmpresa = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT nombre_empresa, validada, logo_path FROM Empresa WHERE id_usuario = ?',
      [id_usuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Perfil de empresa no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener estado empresa:', error);
    res.status(500).json({ error: 'Error del servidor al verificar estado.' });
  }
};
