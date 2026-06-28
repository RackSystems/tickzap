import { Router } from "express";
import WebhookController from "./WebhookController";

// Webhooks externos (Evolution API). Sem authMiddleware — a validação de origem
// (token/assinatura da Evolution) entra na task #2.
const router = Router();

router.post("/evolution", WebhookController.evolutionHandle);

export default router;
