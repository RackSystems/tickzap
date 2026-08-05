import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {AuthEnv, requireAuth} from "@/modules/auth/middleware";
import { tenantSchema, tenantIdParamSchema, tenantQuerySchema, updateTenantSchema } from "@/modules/tenant/tenant.schema";
import * as TenantService from "@/modules/tenant/tenant.service";

const router = new Hono<AuthEnv>();

router.use("*", requireAuth);

router.get("/", zValidator("query", tenantQuerySchema), async ( c) => {
  return c.json(await TenantService.list(c.req.valid("query")));
});

router.post("/", zValidator("json", tenantSchema), async (c) => {
  const data = c.req.valid("json");
  const created = await TenantService.create(data);
  return c.json(created, 201);
});

export default router;
