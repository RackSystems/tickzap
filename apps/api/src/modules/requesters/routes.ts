import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {requireAuth} from "@/modules/auth/middleware";
import * as RequesterService from "@/modules/requesters/requester.service";
import {requesterQuerySchema, requesterSchema} from "@/modules/requesters/requester.schema";
import {requireTenant, type TenantEnv} from "@/modules/tenant/middleware";

const router = new Hono<TenantEnv>();

router.use("*", requireAuth, requireTenant);

router.get("/", zValidator("query", requesterQuerySchema), async ( c) => {
  return c.json(await RequesterService.list(c.var.scope, c.req.valid("query")));
});

router.post("/", zValidator("json", requesterSchema), async (c) => {
  const requester = c.req.valid("json");
  return c.json(await RequesterService.create(c.var.scope, requester), 201);
});

export default router;