import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {AuthEnv, requireAuth} from "@/modules/auth/middleware";
import * as RequesterService from "@/modules/requesters/requester.service";
import {requesterQuerySchema, requesterSchema} from "@/modules/requesters/requester.schema";
import {requireTenant} from "@/modules/tenant/middleware";

const router = new Hono<AuthEnv>();

router.use("*", requireAuth, requireTenant);

router.get("/", zValidator("query", requesterQuerySchema), async ( c) => {
  return c.json(await RequesterService.list(c.req.valid("query")));
});

router.post("/", zValidator("json", requesterSchema), async (c) => {
  const requester = c.req.valid("json");
  return c.json(await RequesterService.create(requester), 201);
});

export default router;