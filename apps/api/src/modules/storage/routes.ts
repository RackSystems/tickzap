import { Router } from "express";
import StorageController from "./StorageController";
import { authMiddleware } from "../../app/middlewares/authMiddleware";

const router = Router();

router.post("/upload", authMiddleware, StorageController.upload);

export default router;
