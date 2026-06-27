import { Router } from "express";
import MessageController from "./MessageController";
import { authMiddleware } from "../../app/middlewares/authMiddleware";

// Rotas de mensagens são escopadas por conversation — montadas sob o prefixo "/conversations".
const router = Router();

router.get("/:id/messages", authMiddleware, MessageController.index);
// router.get('/:id/messages/:messageId', authMiddleware, handleValidation, MessageController.show)
router.post("/messages", authMiddleware, MessageController.store);
router.post("/messages/send", authMiddleware, MessageController.sendMessage);

export default router;
