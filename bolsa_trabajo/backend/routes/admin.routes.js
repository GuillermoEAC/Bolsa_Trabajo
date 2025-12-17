// Backend/routes/admin.routes.js
import express from 'express';
const router = express.Router();

import {
  obtenerEmpresas,
  cambiarEstadoEmpresa, // ¡Deja esta!
  obtenerVacantesAdmin,
  moderarVacante,
  eliminarVacanteAdmin,
  obtenerUsuarios,
  eliminarUsuario,
  obtenerEstadisticas, // cambiarEstadoEmpresa, <-- ELIMINA ESTA LÍNEA
} from '../controllers/admin.controller.js';

// Nota: He usado nombres genéricos para los controladores, asegúrate que
// los nombres reales de las funciones en tu archivo sean correctos.

// Rutas /api/admin/empresas
router.get('/empresas', obtenerEmpresas);
router.put('/empresas/:id/estado', cambiarEstadoEmpresa);

// Rutas /api/admin/vacantes
router.get('/vacantes', obtenerVacantesAdmin); // o el nombre que uses
router.put('/vacantes/:id/moderar', moderarVacante); // <-- ESTA ES LA RUTA QUE FALTABA
router.delete('/vacantes/:id', eliminarVacanteAdmin); // o el nombre que uses

// Rutas /api/admin/usuarios
router.get('/usuarios', obtenerUsuarios);
router.delete('/usuarios/:tipo/:id', eliminarUsuario);

// Rutas /api/admin/estadisticas
router.get('/estadisticas', obtenerEstadisticas);

export default router;
