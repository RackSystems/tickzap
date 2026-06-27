import { body, param } from 'express-validator';
import { conversationStatuses } from '../../config/schema';

export const validateConversationStore = [
  body('contactId').notEmpty().withMessage('ID do contato é obrigatório'),
  body('channelId').notEmpty().withMessage('ID do canal é obrigatório'),
  body('status').optional().isIn(conversationStatuses).withMessage('Status inválido'),
];

export const validateConversationUpdate = [
  body('contactId').optional().notEmpty().withMessage('ID do contato não pode ser vazio'),
  body('channelId').optional().notEmpty().withMessage('ID do canal não pode ser vazio'),
  body('status').optional().isIn(conversationStatuses).withMessage('Status inválido'),
  body('UserId').optional(),
];

export const validateIdParam = [
  param('id').notEmpty().withMessage('ID é obrigatório'),
];