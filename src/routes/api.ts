import { Router } from 'express'
import UserController from '../app/controllers/UserController'

const router = Router()

// rotas de usuários
router.get('/users', UserController.index)
router.get('/users/:id', UserController.show)
router.post('/users', UserController.store)
router.put('/users/:id', UserController.update)
router.delete('/users/:id', UserController.destroy)

export default router