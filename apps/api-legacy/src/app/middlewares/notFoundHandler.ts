import { Request, Response, NextFunction } from "express";
import NotFoundException from "@/app/exceptions/NotFoundException";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundException(`Route not found: ${req.method} ${req.originalUrl}`));
};
