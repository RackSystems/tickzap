import { Request, Response } from "express";
import AuthService from "./AuthService";
import BadRequestException from "@/app/exceptions/BadRequestException";

export async function authenticate(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestException("Email e senha são obrigatórios");
  }

  const userId = await AuthService.authenticate(email, password);

  if (userId === null) {
    res.status(401).json({ message: "Falha ao autenticar: email ou senha inválidos" });
    return;
  }

  res.cookie("userId", userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600 * 1000 * 1000,
  });

  res.status(200).json({ message: "Login bem-sucedido" });
}

export async function deauthenticate(_req: Request, res: Response): Promise<void> {
  res.clearCookie("userId");
  res.json({ message: "Logout bem-sucedido" });
}

export async function me(req: Request, res: Response): Promise<void> {
  const response = await AuthService.me(req.cookies.userId);
  res.json({ message: "Usuário autenticado", body: response });
}
