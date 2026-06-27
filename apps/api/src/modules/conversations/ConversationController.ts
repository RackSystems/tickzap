import { Request, Response } from "express";
import ConversationService from "./ConversationService";

export default {
  async index(req: Request, res: Response) {
    const conversation = await ConversationService.index(req.query);
    res.json(conversation);
  },

  async show(req: Request, res: Response) {
    const conversation = await ConversationService.show({ id: req.params.id });
    res.json(conversation);
  },

  async store(req: Request, res: Response) {
    const conversation = await ConversationService.store(req.body);
    res.status(201).json(conversation);
  },

  async update(req: Request, res: Response) {
    const conversation = await ConversationService.update(req.params.id, req.body);
    res.json(conversation);
  },

  async destroy(req: Request, res: Response) {
    await ConversationService.destroy(req.params.id);
    res.status(204).end();
  },

  async toggleAI(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const conversation = await ConversationService.toggleAI(id);
    res.json(conversation);
  },
};
