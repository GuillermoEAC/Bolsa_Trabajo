// Backend/controllers/auth.controller.js
import bcrypt from 'bcrypt';

export const login = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });

    const [usuarios] = await pool.query(
      'SELECT id_usuario, email, contraseña, id_rol FROM Usuario WHERE email = ?',
      [email]
    );

    if (usuarios.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const usuario = usuarios[0];
    const passwordMatch = await bcrypt.compare(password, usuario.contraseña);

    if (!passwordMatch) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Login exitoso
    res.json({
      mensaje: 'Login exitoso',
      usuario: { id_usuario: usuario.id_usuario, email: usuario.email, id_rol: usuario.id_rol },
      token: 'fake-jwt-token', // Implementar JWT real después
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en servidor' });
  }
};

export const registro = async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { email, password, id_rol } = req.body;

    const [exists] = await pool.query('SELECT id_usuario FROM Usuario WHERE email = ?', [email]);
    if (exists.length > 0) return res.status(400).json({ error: 'El email ya está registrado' });

    const hash = await bcrypt.hash(password, 10);

    // Insertamos usuario
    const [result] = await pool.query(
      'INSERT INTO Usuario (email, contraseña, id_rol) VALUES (?, ?, ?)',
      [email, hash, id_rol || 2] // 2 = Estudiante por defecto
    );

    // Retornamos el ID para que el frontend pueda guardar el CV inmediatamente
    res.status(201).json({
      mensaje: 'Usuario registrado',
      id_usuario: result.insertId,
      email: email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar' });
  }
};
