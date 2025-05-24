import { Request, Response, NextFunction } from 'express'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = req.cookies.userId

  if (!userId) {
    throw new Error('Acesso não autorizado')
  }

  next()
}
