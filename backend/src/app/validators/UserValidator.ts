import { body } from 'express-validator';
import { param } from 'express-validator';

export const validateUserStore = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').notEmpty().isEmail().withMessage('E-mail inválido'),
  body('password').notEmpty().isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
];

export const validateUserUpdate = [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('email').optional().isEmail().withMessage('E-mail inválido'),
  body('password').optional().isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
];

export const validateIdParam = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('ID é obrigatório e deve ser uma string válida')
];
