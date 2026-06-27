import { Router } from "express";
import UserController from "./UserController";
import { authMiddleware } from "../../app/middlewares/authMiddleware";
import { validate } from "../../app/middlewares/validate";
import { createUserSchema, updateUserSchema, changeStatusSchema } from "./UserValidator";

const router = Router();

router.get("/", authMiddleware, UserController.index);
router.get("/:id", authMiddleware, UserController.show);
router.post("/", validate(createUserSchema), UserController.store);
router.put("/:id", authMiddleware, validate(updateUserSchema), UserController.update);
router.delete("/:id", authMiddleware, UserController.destroy);
router.patch("/:id/activate", authMiddleware, UserController.enableOrDisable);
router.patch("/:id/status", authMiddleware, validate(changeStatusSchema), UserController.changeStatus);

export default router;
