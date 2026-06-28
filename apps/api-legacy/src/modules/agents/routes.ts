import { Router } from "express";
import AgentController from "./AgentController";
import { authMiddleware } from "@/app/middlewares/authMiddleware";
import { handleValidation } from "@/app/middlewares/handleValidationMiddleware";
import { validateAgentStore, validateAgentUpdate, validateUseAgent } from "./AgentValidator";

const router = Router();

router.get("/", authMiddleware, AgentController.index);
router.get("/:id", authMiddleware, AgentController.show);
router.post("/", authMiddleware, validateAgentStore, handleValidation, AgentController.store);
router.put("/:id", authMiddleware, validateAgentUpdate, handleValidation, AgentController.update);
router.delete("/:id", authMiddleware, AgentController.destroy);
router.post("/:id/use", authMiddleware, validateUseAgent, handleValidation, AgentController.use);

export default router;
