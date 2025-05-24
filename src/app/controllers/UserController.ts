import { Request, Response } from 'express'
import UserService from '../services/UserService'

export default {
  async index(req: Request, res: Response) {
    const users = await UserService.getAll()
    res.json(users)
  },

  async show(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) return res.status(404).json({error: 'Usuário não encontrado!'})

    const user = await UserService.getById(id)
    res.status(200).json(user)
  },

  async store(req: Request, res: Response) {
    const user = await UserService.create(req.body)
    res.status(201).json(user)
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(404).json({error: 'Usuário não encontrado!'})

      const user = await UserService.update(id, req.body)
      res.status(200).json(user)
    } catch (error) {
      return res.status(400).json({error: 'Erro ao atualizar usuário!'})
    }
  },

  async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(404).json({error: 'Usuário não encontrado!'})

      await UserService.delete(id)
      res.status(204).end()
    } catch (error) {
      return res.status(400).json({error: 'Erro ao excluir usuário!'})
    }
  }
}
