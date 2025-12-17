import crypto from 'crypto';
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';

import { crearNotificacionInterna } from './notificaciones.controller.js';
// ==========================================================
// ========== 🔑 FUNCIONES DE AUTENTICACIÓN (LOGIN/REGISTER) ==========
// ==========================================================

export const login = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan datos' }); // Buscar usuario por email

    const [usuarios] = await pool.query(
      'SELECT id_usuario, email, contraseña, id_rol FROM Usuario WHERE email = ?',
      [email]
    );

    if (usuarios.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const usuario = usuarios[0]; // Comparar la contraseña hasheada
    const passwordMatch = await bcrypt.compare(password, usuario.contraseña);

    if (!passwordMatch) return res.status(401).json({ error: 'Credenciales inválidas' }); // Generar JWT (JSON Web Token)

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        id_rol: usuario.id_rol,
      },
      process.env.JWT_SECRET || 'secreto_temporal', // Usar variable de entorno o fallback
      { expiresIn: '7d' }
    );

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        id_rol: usuario.id_rol,
      },
      token,
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error interno del servidor durante el login' });
  }
};

// export const registro = async (req, res) => {
//   const pool = req.app.locals.pool;
//   try {
//     const { email, password, id_rol } = req.body;

//     const [exists] = await pool.query('SELECT id_usuario FROM Usuario WHERE email = ?', [email]);
//     if (exists.length > 0) return res.status(400).json({ error: 'El email ya está registrado' });

//     const hash = await bcrypt.hash(password, 10);

//     const [result] = await pool.query(
//       'INSERT INTO Usuario (email, contraseña, id_rol) VALUES (?, ?, ?)',
//       [email, hash, id_rol || 2]
//     );

//     res.status(201).json({
//       mensaje: 'Usuario registrado',
//       id_usuario: result.insertId,
//       email: email,
//     });
//   } catch (error) {
//     console.error('Error en el registro:', error);
//     res.status(500).json({ error: 'Error interno del servidor durante el registro' });
//   }
// };

// ==========================================================
// ==========  FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA ==========
// ==========================================================
export const registro = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { email, password, id_rol } = req.body;

    const [exists] = await pool.query('SELECT id_usuario FROM Usuario WHERE email = ?', [email]);
    if (exists.length > 0) return res.status(400).json({ error: 'El email ya está registrado' });

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO Usuario (email, contraseña, id_rol) VALUES (?, ?, ?)',
      [email, hash, id_rol || 2]
    );

    const idNuevoUsuario = result.insertId;

    let mensajeBienvenida = '';

    if (id_rol === 2 || !id_rol) {
      mensajeBienvenida =
        '¡Bienvenido a Primer Paso! 🎓 Completa tu perfil y sube tu CV para que las empresas te encuentren.';
    }

    if (mensajeBienvenida) {
      await crearNotificacionInterna(pool, idNuevoUsuario, mensajeBienvenida, 'exito');
    }

    res.status(201).json({
      mensaje: 'Usuario registrado',
      id_usuario: idNuevoUsuario,
      email: email,
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ error: 'Error interno del servidor durante el registro' });
  }
};
export const solicitarRecuperacion = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { email } = req.body;

    const [user] = await pool.query('SELECT id_usuario FROM Usuario WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.json({ mensaje: 'Instrucciones enviadas a tu email (si existe)' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + 3600000);

    await pool.query('DELETE FROM Token_Recuperacion WHERE id_usuario = ?', [user[0].id_usuario]);

    await pool.query(
      'INSERT INTO Token_Recuperacion (id_usuario, token_hash, fecha_expiracion) VALUES (?, ?, ?)',
      [user[0].id_usuario, token, expiracion]
    );

    res.json({
      mensaje: 'Instrucciones enviadas a tu email',
      ...(process.env.NODE_ENV === 'development' && { token }),
    });
  } catch (error) {
    console.error('Error al solicitar recuperación:', error);
    res.status(500).json({ error: 'Error al solicitar recuperación' });
  }
};

export const restablecerPassword = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { token, newPassword } = req.body;

    const [tokenInfo] = await pool.query(
      'SELECT id_usuario FROM Token_Recuperacion WHERE token_hash = ? AND fecha_expiracion > NOW() AND usado = FALSE',
      [token]
    );

    if (tokenInfo.length === 0) {
      return res.status(400).json({ error: 'Token inválido, expirado o ya usado.' });
    }

    const id_usuario = tokenInfo[0].id_usuario;
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE Usuario SET contraseña = ? WHERE id_usuario = ?', [hash, id_usuario]);
    await pool.query('UPDATE Token_Recuperacion SET usado = TRUE WHERE token_hash = ?', [token]);

    res.json({ mensaje: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
};
