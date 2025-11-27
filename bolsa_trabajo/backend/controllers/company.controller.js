import bcrypt from 'bcrypt';

// Registro completo: Crea Usuario + Perfil de Empresa + Subida de Logo
export const registerCompany = async (req, res) => {
  const pool = req.app.locals.pool;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // NOTA: Con FormData y Multer, los datos llegan planos en req.body, no como objetos anidados JSON.
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

    // Capturamos el archivo si existe
    // req.file es inyectado por el middleware de Multer en la ruta
    const logoPath = req.file ? req.file.path : null;

    // 1. Validar si el email ya existe
    const [exists] = await connection.query('SELECT id_usuario FROM Usuario WHERE email = ?', [
      email,
    ]);

    if (exists.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    // 2. Crear el Usuario (Rol 3 = Empresa)
    const hash = await bcrypt.hash(password, 10);
    const [resUser] = await connection.query(
      'INSERT INTO Usuario (email, contraseña, id_rol) VALUES (?, ?, 3)',
      [email, hash]
    );
    const newUserId = resUser.insertId;

    // 3. Crear el Perfil de Empresa
    // Guardamos 'logoPath' en la columna correspondiente (asegúrate de haber actualizado tu DB)
    await connection.query(
      `INSERT INTO Empresa 
      (id_usuario, nombre_empresa, razon_social, nit, email_contacto, sitio_web, descripcion, logo_path, validada) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        newUserId,
        nombre_empresa,
        razon_social,
        nit,
        email_contacto || email, // Si no envían contacto, usamos el de registro
        sitio_web,
        descripcion,
        logoPath, // <--- AQUÍ GUARDAMOS LA RUTA DEL ARCHIVO
      ]
    );

    await connection.commit();

    res.status(201).json({
      mensaje: 'Empresa registrada. Pendiente de validación por el administrador.',
      logo: logoPath,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error en registro de empresa:', error);
    res.status(500).json({ error: 'Error del servidor al registrar empresa.' });
  } finally {
    connection.release();
  }
};
