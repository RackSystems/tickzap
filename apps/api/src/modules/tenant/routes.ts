import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { requireAuth } from "@/modules/auth/middleware";
import { requireTenant, type TenantEnv } from "@/modules/tenant/middleware";
import { tenantQuerySchema } from "@/modules/tenant/tenant.schema";
import * as TenantService from "@/modules/tenant/tenant.service";

const router = new Hono<TenantEnv>();

router.use("*", requireAuth, requireTenant);

// Não há rota de criação: o provisionamento de tenants é manual até existir
// um papel de admin da plataforma.
router.get("/", zValidator("query", tenantQuerySchema), async (c) => {
  return c.json(await TenantService.list(c.var.scope, c.req.valid("query")));
});

export default router;
