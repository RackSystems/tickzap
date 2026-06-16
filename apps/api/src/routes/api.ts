import { Router } from "express";
import AuthController from "../app/controllers/AuthController";
import { authMiddleware } from "../app/middlewares/authMiddleware";
import TicketController from "../app/controllers/TicketController";
import WebhookController from "../app/controllers/WebhookController";
import MessageController from "../app/controllers/MessageController";
import StorageController from "../app/controllers/StorageController";
import { handleValidation } from "../app/middlewares/handleValidationMiddleware";
import { validateTicketStore, validateTicketUpdate } from "../app/validators/TicketValidator";
import usersRoutes from "../modules/users/routes";
import contactsRoutes from "../modules/contacts/routes";
import channelsRoutes from "../modules/channels/routes";
import agentsRoutes from "../modules/agents/routes";

const router = Router();

// Auth
router.post("/login", AuthController.authenticate);
router.post("/logout", authMiddleware, AuthController.deauthenticate);
router.get("/me", authMiddleware, AuthController.me);

router.use("/users", usersRoutes);

router.use("/channels", channelsRoutes);

router.use("/contacts", contactsRoutes);

// Tickets
router.get("/tickets", authMiddleware, TicketController.index);
router.get("/tickets/:id", authMiddleware, handleValidation, TicketController.show);
router.post("/tickets", authMiddleware, validateTicketStore, handleValidation, TicketController.store);
router.put("/tickets/:id", authMiddleware, validateTicketUpdate, handleValidation, TicketController.update);
router.delete("/tickets/:id", authMiddleware, handleValidation, TicketController.destroy);

// Ticket Messages
router.get("/tickets/:id/messages", authMiddleware, MessageController.index);
// router.get('/tickets/:id/messages/:messageId', authMiddleware, handleValidation, MessageController.show)
router.post("/tickets/messages", authMiddleware, MessageController.store);
router.post("/tickets/messages/send", authMiddleware, MessageController.sendMessage);
router.patch("/tickets/:id/ai", authMiddleware, TicketController.toggleAI);

router.use("/agents", agentsRoutes);

// Storage
router.post("/storage/upload", authMiddleware, StorageController.upload);

// Webhooks
router.post("/webhook/evolution", WebhookController.evolutionHandle);

export default router;
