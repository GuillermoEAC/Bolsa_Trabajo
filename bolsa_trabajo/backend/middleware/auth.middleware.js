import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

export const esAdmin = (req, res, next) => {
  if (req.usuario.id_rol !== 1) {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
  }
  next();
};

export const esEmpresa = (req, res, next) => {
  if (req.usuario.id_rol !== 3) {
    return res.status(403).json({ error: 'Acceso denegado. Solo empresas.' });
  }
  next();
};

export const esEstudiante = (req, res, next) => {
  if (req.usuario.id_rol !== 2) {
    return res.status(403).json({ error: 'Acceso denegado. Solo estudiantes.' });
  }
  next();
};
