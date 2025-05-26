import { Request, Response, NextFunction } from 'express'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = req.cookies?.userId

  if (!userId) {
    return res.status(401).json({
      error: 'Acesso não autorizado',
      message: 'Você precisa estar logado para acessar este recurso',
    })
  }

  next()
}
