import bcrypt from 'bcrypt';

export const registerCompany = async (req, res) => {
  const pool = req.app.locals.pool;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Al usar FormData, los datos llegan "planos" en req.body
    // No llegan como objetos anidados (cuenta.email), sino directos (email)
    const {
      email,
      password,
      nombre_empresa,
      razon_social,
      nit, // o nit_rfc
      email_contacto,
      sitio_web,
      descripcion,
    } = req.body;

    // req.file es inyectado por Multer si se subió una imagen
    // Guardamos la ruta relativa para servirla después
    const logoPath = req.file ? `uploads/logos/${req.file.filename}` : null;

    // 1. Validar si el usuario existe
    const [exists] = await connection.query('SELECT id_usuario FROM Usuario WHERE email = ?', [
      email,
    ]);
    if (exists.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    // 2. Crear Usuario (Rol 3 = Empresa)
    const hash = await bcrypt.hash(password, 10);
    const [resUser] = await connection.query(
      'INSERT INTO Usuario (email, contraseña, id_rol) VALUES (?, ?, 3)',
      [email, hash]
    );
    const newUserId = resUser.insertId;

    // 3. Crear Perfil de Empresa
    // IMPORTANTE: Asegúrate de que la columna en tu DB se llame 'logo_path' o 'url_logo'
    // Aquí uso 'logo_path' como acordamos.
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
        logoPath, // Guardamos la ruta del archivo
      ]
    );

    await connection.commit();

    res.status(201).json({
      mensaje: 'Empresa registrada exitosamente. Pendiente de validación.',
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
