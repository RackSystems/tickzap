import { Router } from "express";
import ChannelController from "./ChannelController";
import { authMiddleware } from "@/app/middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, ChannelController.index);
router.get("/:id/connect", authMiddleware, ChannelController.connect);
router.get("/:id/status", authMiddleware, ChannelController.getStatus);
router.get("/:id", authMiddleware, ChannelController.show);
router.post("/", authMiddleware, ChannelController.store);
router.put("/:id", authMiddleware, ChannelController.update);
router.delete("/:id", authMiddleware, ChannelController.destroy);

export default router;
