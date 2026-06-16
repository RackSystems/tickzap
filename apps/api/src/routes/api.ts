import { Router } from "express";
import AuthController from "../app/controllers/AuthController";
import { authMiddleware } from "../app/middlewares/authMiddleware";
import ChannelController from "../app/controllers/ChannelController";
import TicketController from "../app/controllers/TicketController";
import WebhookController from "../app/controllers/WebhookController";
import MessageController from "../app/controllers/MessageController";
import StorageController from "../app/controllers/StorageController";
import { handleValidation } from "../app/middlewares/handleValidationMiddleware";
import { validateTicketStore, validateTicketUpdate } from "../app/validators/TicketValidator";
import AgentController from "../app/controllers/AgentController";
import { validateAgentStore, validateAgentUpdate, validateUseAgent } from "../app/validators/AgentValidator";
import usersRoutes from "../modules/users/routes";
import contactsRoutes from "../modules/contacts/routes";

const router = Router();

// Auth
router.post("/login", AuthController.authenticate);
router.post("/logout", authMiddleware, AuthController.deauthenticate);
router.get("/me", authMiddleware, AuthController.me);

router.use("/users", usersRoutes);

// Channels
router.get("/channels", authMiddleware, ChannelController.index);
router.get("/channels/:id/connect", authMiddleware, ChannelController.connect);
router.get("/channels/:id/status", authMiddleware, ChannelController.getStatus);
router.get("/channels/:id", authMiddleware, ChannelController.show);
router.post("/channels", authMiddleware, ChannelController.store);
router.put("/channels/:id", authMiddleware, ChannelController.update);
router.delete("/channels/:id", authMiddleware, ChannelController.destroy);

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

// Agents
router.get("/agents", authMiddleware, AgentController.index);
router.get("/agents/:id", authMiddleware, AgentController.show);
router.post("/agents", authMiddleware, validateAgentStore, handleValidation, AgentController.store);
router.put("/agents/:id", authMiddleware, validateAgentUpdate, handleValidation, AgentController.update);
router.delete("/agents/:id", authMiddleware, AgentController.destroy);
router.post("/agents/:id/use", authMiddleware, validateUseAgent, handleValidation, AgentController.use);

// Storage
router.post("/storage/upload", authMiddleware, StorageController.upload);

// Webhooks
router.post("/webhook/evolution", WebhookController.evolutionHandle);

export default router;
