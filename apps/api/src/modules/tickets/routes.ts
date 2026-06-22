import { Router } from "express";
import TicketController from "./TicketController";
import { authMiddleware } from "../../app/middlewares/authMiddleware";
import { handleValidation } from "../../app/middlewares/handleValidationMiddleware";
import { validateTicketStore, validateTicketUpdate } from "./TicketValidator";

const router = Router();

router.get("/", authMiddleware, TicketController.index);
router.get("/:id", authMiddleware, TicketController.show);
router.post("/", authMiddleware, validateTicketStore, handleValidation, TicketController.store);
router.put("/:id", authMiddleware, validateTicketUpdate, handleValidation, TicketController.update);
router.delete("/:id", authMiddleware, TicketController.destroy);
router.patch("/:id/ai", authMiddleware, TicketController.toggleAI);

export default router;
