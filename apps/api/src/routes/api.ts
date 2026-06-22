import { Router } from "express";
import authRoutes from "../modules/auth/routes";
import usersRoutes from "../modules/users/routes";
import channelsRoutes from "../modules/channels/routes";
import contactsRoutes from "../modules/contacts/routes";
import ticketsRoutes from "../modules/tickets/routes";
import messagesRoutes from "../modules/messages/routes";
import agentsRoutes from "../modules/agents/routes";
import storageRoutes from "../modules/storage/routes";
import webhooksRoutes from "../modules/webhooks/routes";

const router = Router();

router.use("/", authRoutes);
router.use("/users", usersRoutes);
router.use("/channels", channelsRoutes);
router.use("/contacts", contactsRoutes);
router.use("/tickets", ticketsRoutes);
router.use("/tickets", messagesRoutes);
router.use("/agents", agentsRoutes);
router.use("/storage", storageRoutes);
router.use("/webhook", webhooksRoutes);

export default router;
