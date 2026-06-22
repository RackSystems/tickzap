import { Router } from "express";
import AuthController from "./AuthController";
import { authMiddleware } from "../../app/middlewares/authMiddleware";

const router = Router();

router.post("/login", AuthController.authenticate);
router.post("/logout", authMiddleware, AuthController.deauthenticate);
router.get("/me", authMiddleware, AuthController.me);

export default router;
