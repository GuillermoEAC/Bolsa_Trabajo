// backend/config/multer.config.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que la carpeta 'uploads/logos' exista
const uploadDir = 'uploads/logos';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Carpeta destino
  },
  filename: (req, file, cb) => {
    // Nombre único: timestamp + extensión original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Solo aceptar imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, png, jpg)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
});

module.exports = upload;
