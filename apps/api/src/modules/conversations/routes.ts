import { Router } from "express";
import ConversationController from "./ConversationController";
import { authMiddleware } from "../../app/middlewares/authMiddleware";
import { handleValidation } from "../../app/middlewares/handleValidationMiddleware";
import { validateConversationStore, validateConversationUpdate } from "./ConversationValidator";

const router = Router();

router.get("/", authMiddleware, ConversationController.index);
router.get("/:id", authMiddleware, ConversationController.show);
router.post("/", authMiddleware, validateConversationStore, handleValidation, ConversationController.store);
router.put("/:id", authMiddleware, validateConversationUpdate, handleValidation, ConversationController.update);
router.delete("/:id", authMiddleware, ConversationController.destroy);
router.patch("/:id/ai", authMiddleware, ConversationController.toggleAI);

export default router;
