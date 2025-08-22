import { Router } from 'express'
import UserController from '../app/controllers/UserController'
import AuthController from '../app/controllers/AuthController'
import { authMiddleware } from '../app/middlewares/authMiddleware';
import ChannelController from '../app/controllers/ChannelController';
import ContactController from '../app/controllers/ContactController';
import { handleValidation } from '../app/middlewares/handleValidationMiddleware';
import {
  validateUserStore,
  validateUserUpdate,
  validateIdParam,
  validateUserStatus,
} from '../app/validators/UserValidator';
import { validateContactStore, validateContactUpdate, validateIdParam } from '../app/validators/ContactValidator';

const router = Router()

// Auth
router.post('/login', AuthController.authenticate)
router.post('/logout', authMiddleware, AuthController.deauthenticate)
router.get('/me', authMiddleware, AuthController.me)

// rotas de usuários
router.get('/users', UserController.index)
router.get('/users/:id', validateIdParam, handleValidation, UserController.show)
router.post('/users', validateUserStore, handleValidation, UserController.store)
router.put('/users/:id', validateIdParam, validateUserUpdate, handleValidation, UserController.update)
router.delete('/users/:id', validateIdParam, handleValidation, UserController.destroy)
router.patch('/users/:id/activate', validateIdParam, handleValidation, UserController.enableOrDisable)
router.patch('/users/:id/status', validateIdParam, validateUserStatus, handleValidation, UserController.changeStatus)

// rotas de canais
router.get('/channels', ChannelController.index)
router.get('/channels/:id/connect', ChannelController.connect)
router.get('/channels/:id/status', ChannelController.getStatus)
router.get('/channels/:id', ChannelController.show)
router.post('/channels', ChannelController.store)
router.put('/channels/:id', ChannelController.update)
router.delete('/channels/:id', ChannelController.destroy)

// rotas de contatos
router.get('/contacts', ContactController.index)
router.get('/contacts/:id', validateIdParam, handleValidation, ContactController.show)
router.post('/contacts', validateContactStore, handleValidation, ContactController.store)
router.put('/contacts/:id', validateIdParam, validateContactUpdate, handleValidation, ContactController.update)
router.delete('/contacts/:id', validateIdParam, handleValidation, ContactController.destroy)

export default router
