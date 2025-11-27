// backend/routes/company.routes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const upload = require('../config/multer.config'); // Importar multer

// Agregamos 'upload.single('logo')' para procesar el archivo
// 'logo' debe coincidir con el nombre del campo en el formulario del frontend
router.post('/register', upload.single('logo'), companyController.register);

module.exports = router;
