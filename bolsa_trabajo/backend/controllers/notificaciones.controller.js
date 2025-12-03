export const crearNotificacion = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario, mensaje, tipo } = req.body;

  try {
    await pool.query(
      'INSERT INTO Notificacion (id_usuario, mensaje, tipo, leida) VALUES (?, ?, ?, 0)',
      [id_usuario, mensaje, tipo]
    );

    res.status(201).json({ mensaje: 'Notificación creada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear notificación' });
  }
};

export const obtenerNotificaciones = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario } = req.params;

  try {
    // 🔥 USAR 'id_usuario' no 'id_usuario_destino'
    const [notificaciones] = await pool.query(
      `
      SELECT * FROM Notificacion 
      WHERE id_usuario = ? 
      ORDER BY fecha_creacion DESC 
      LIMIT 50
    `,
      [id_usuario]
    );

    const [count] = await pool.query(
      `
      SELECT COUNT(*) as no_leidas 
      FROM Notificacion 
      WHERE id_usuario = ? AND leida = 0
    `,
      [id_usuario]
    );

    res.json({
      notificaciones,
      no_leidas: count[0].no_leidas,
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

export const marcarComoLeida = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;

  try {
    await pool.query('UPDATE Notificacion SET leida = 1 WHERE id_notificacion = ?', [id]);
    res.json({ mensaje: 'Notificación marcada como leída' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar notificación' });
  }
};

export const marcarTodasLeidas = async (req, res) => {
  const pool = req.app.locals.pool;
  const { id_usuario } = req.params;

  try {
    await pool.query('UPDATE Notificacion SET leida = 1 WHERE id_usuario = ? AND leida = 0', [
      id_usuario,
    ]);
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al marcar notificaciones' });
  }
};
export const crearNotificacionInterna = async (
  pool,
  id_usuario_destino,
  mensaje,
  tipo_notificacion = 'INFO'
) => {
  try {
    await pool.query(
      'INSERT INTO Notificacion (id_usuario_destino, mensaje, tipo_notificacion, leida) VALUES (?, ?, ?, 0)',
      [id_usuario_destino, mensaje, tipo_notificacion]
    );
    return true;
  } catch (error) {
    console.error('Error interno al crear notificación:', error);
    // Puede que quieras lanzar el error o devolver false.
    return false;
  }
};
