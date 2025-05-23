import { Router } from 'express'
import UserController from '../app/controllers/UserController'

const router = Router()

// rotas de usuários
router.get('/users', UserController.index)
router.post('/users', UserController.store)

export default router