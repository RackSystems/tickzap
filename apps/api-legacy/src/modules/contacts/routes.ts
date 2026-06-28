import { Router } from "express";
import ContactController from "./ContactController";
import { authMiddleware } from "@/app/middlewares/authMiddleware";
import { handleValidation } from "@/app/middlewares/handleValidationMiddleware";
import { validateContactStore, validateContactUpdate } from "./ContactValidator";

const router = Router();

router.get("/", authMiddleware, ContactController.index);
router.get("/:id", authMiddleware, ContactController.show);
router.post("/", authMiddleware, validateContactStore, handleValidation, ContactController.store);
router.put("/:id", authMiddleware, validateContactUpdate, handleValidation, ContactController.update);
router.delete("/:id", authMiddleware, ContactController.destroy);

export default router;
