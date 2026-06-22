import {Request, Response} from 'express'
import StorageService from "./StorageService";

export default {
  async upload(req: Request, res: Response) {
    const media = await StorageService.uploadMediaToStorage(req.body)
    res.status(201).json(media)
  },
}