import { Router } from "express";
import { authenticate, deauthenticate, me } from "./AuthController";
import { authMiddleware } from "@/app/middlewares/authMiddleware";

const router = Router();

router.post("/login", authenticate);
router.post("/logout", authMiddleware, deauthenticate);
router.get("/me", authMiddleware, me);

export default router;
