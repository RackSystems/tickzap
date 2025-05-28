import { Router } from 'express'
import UserController from '../app/controllers/UserController'
import AuthController from '../app/controllers/AuthController'
import { authMiddleware } from '../app/middlewares/authMiddleware';
import ChannelController from '../app/controllers/ChannelController';

const router = Router()

// Auth
router.post('/login', AuthController.authenticate)
router.post('/logout', authMiddleware, AuthController.deauthenticate)
router.get('/me', authMiddleware, AuthController.me)

// rotas de usuários
router.get('/users', UserController.index)
router.get('/users/:id', UserController.show)
router.post('/users', UserController.store)
router.put('/users/:id', UserController.update)
router.delete('/users/:id', UserController.destroy)

// rotas de canais
router.get('/channels', ChannelController.index)
router.get('/channels/:id/connect', ChannelController.connect)
router.get('/channels/:id/status', ChannelController.getStatus)
router.get('/channels/:id', ChannelController.show)
router.post('/channels', ChannelController.store)
router.put('/channels/:id', ChannelController.update)
router.delete('/channels/:id', ChannelController.destroy)

export default router
