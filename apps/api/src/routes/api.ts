import { Router } from "express";
import AuthController from "../app/controllers/AuthController";
import { authMiddleware } from "../app/middlewares/authMiddleware";
import WebhookController from "../app/controllers/WebhookController";
import StorageController from "../app/controllers/StorageController";
import usersRoutes from "../modules/users/routes";
import contactsRoutes from "../modules/contacts/routes";
import channelsRoutes from "../modules/channels/routes";
import agentsRoutes from "../modules/agents/routes";
import ticketsRoutes from "../modules/tickets/routes";
import messagesRoutes from "../modules/messages/routes";

const router = Router();

// Auth
router.post("/login", AuthController.authenticate);
router.post("/logout", authMiddleware, AuthController.deauthenticate);
router.get("/me", authMiddleware, AuthController.me);

router.use("/users", usersRoutes);

router.use("/channels", channelsRoutes);

router.use("/contacts", contactsRoutes);

router.use("/tickets", ticketsRoutes);

router.use("/tickets", messagesRoutes);

router.use("/agents", agentsRoutes);

// Storage
router.post("/storage/upload", authMiddleware, StorageController.upload);

// Webhooks
router.post("/webhook/evolution", WebhookController.evolutionHandle);

export default router;
