import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authenticate, deauthenticate, me } from "./AuthController.hono";
import { authMiddleware } from "@/app/middlewares/authMiddleware.hono";
import { loginSchema } from "./AuthValidator";

const routes = new Hono<{ Variables: { userId: string } }>();

routes.post("/login", zValidator("json", loginSchema), authenticate);
routes.post("/logout", authMiddleware, deauthenticate);
routes.get("/me", authMiddleware, me);

export default routes;
