import { body, validationResult } from 'express-validator';

export const validarResultados = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validarRegistroEmpresa = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
  body('nombre_empresa').notEmpty().withMessage('Nombre de empresa requerido'),
  validarResultados,
];

export const validarLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida'),
  validarResultados,
];

export const validarVacante = [
  body('titulo').notEmpty().withMessage('Título requerido'),
  body('descripcion')
    .isLength({ min: 50 })
    .withMessage('Descripción muy corta (mínimo 50 caracteres)'),
  body('salario_min').isNumeric().withMessage('Salario mínimo debe ser número'),
  validarResultados,
];
