import { Request, Response } from 'express'
import UserService from '../services/UserService'

export default {
  async index(req: Request, res: Response) {
    const users = await UserService.getAll()
    res.json(users)
  },

  async store(req: Request, res: Response) {
    const user = await UserService.create(req.body)
    res.status(201).json(user)
  }
}
