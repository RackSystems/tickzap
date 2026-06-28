import { Request, Response } from "express";
import UserService from "./UserService";
import NotFoundException from "@/app/exceptions/NotFoundException";

export default {
  async index(req: Request, res: Response): Promise<void> {
    const users = await UserService.index(req.query);
    res.json(users);
  },

  async show(req: Request, res: Response): Promise<void> {
    const user = await UserService.show({ id: req.params.id });
    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }
    res.json(user);
  },

  async store(req: Request, res: Response): Promise<void> {
    const user = await UserService.store(req.body);
    res.status(201).json(user);
  },

  async update(req: Request, res: Response): Promise<void> {
    const user = await UserService.update(req.params.id, req.body);
    res.json(user);
  },

  async destroy(req: Request, res: Response): Promise<void> {
    await UserService.destroy(req.params.id);
    res.status(204).end();
  },

  async changeStatus(req: Request, res: Response): Promise<void> {
    const user = await UserService.changeStatus(req.params.id, req.body.status);
    res.json(user);
  },

  async enableOrDisable(req: Request, res: Response): Promise<void> {
    const user = await UserService.enableOrDisable(req.params.id);
    res.json(user);
  },
};
