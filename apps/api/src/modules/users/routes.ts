import { Router } from "express";
import UserController from "./UserController";
import { authMiddleware } from "../../app/middlewares/authMiddleware";
import { handleValidation } from "../../app/middlewares/handleValidationMiddleware";
import { validateUserStore, validateUserUpdate, validateUserStatus } from "./UserValidator";

const router = Router();

router.get("/", authMiddleware, UserController.index);
router.get("/:id", authMiddleware, UserController.show);
router.post("/", validateUserStore, handleValidation, UserController.store);
router.put("/:id", authMiddleware, validateUserUpdate, handleValidation, UserController.update);
router.delete("/:id", authMiddleware, UserController.destroy);
router.patch("/:id/activate", authMiddleware, UserController.enableOrDisable);
router.patch("/:id/status", authMiddleware, validateUserStatus, handleValidation, UserController.changeStatus);

export default router;
