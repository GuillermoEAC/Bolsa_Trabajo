// // backeng/Cruds/users.js

// import { Router } from 'express';

// const router = Router();

// router.get('/', async (req, res) => {
//   const pool = req.app.locals.pool;
//   const { email, contraseña } = req.body;
//   try {
//     const [result] = await pool.query(
//       'Select * From usuario where email =  ?, contraseña = ?'[(email, contraseña)]
//     );
//     if (result.llength === 0) {
//       return res.status(404).json({ error: 'no jalo pinpollin' });
//     }
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ error: 'no jalo pinpollin' });
//   }
// });

// export default router;
// backend/Cruds/users.js
import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    const [result] = await pool.query('SELECT * FROM usuario');

    if (result.length === 0) {
      return res.status(404).json({ error: 'No hay usuarios' });
    }

    res.json(result);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

export default router;
