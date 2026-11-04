import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { requireAuth } from "@/modules/auth/middleware";
import * as UserService from "./user.service";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userQuerySchema,
} from "./user.schema";
import { requireTenant, type TenantEnv } from "@/modules/tenant/middleware";

const router = new Hono<TenantEnv>();

router.use("*", requireAuth, requireTenant);

router.get("/", zValidator("query", userQuerySchema), async (c) => {
  return c.json(await UserService.list(c.var.scope, c.req.valid("query")));
});

router.get("/:id", zValidator("param", userIdParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  return c.json(await UserService.getById(c.var.scope, id));
});

router.post("/", zValidator("json", createUserSchema), async (c) => {
  return c.json(await UserService.create(c.var.scope, c.req.valid("json")), 201);
});

router.put(
  "/:id",
  zValidator("param", userIdParamSchema),
  zValidator("json", updateUserSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    return c.json(await UserService.update(c.var.scope, id, c.req.valid("json")));
  },
);

router.delete("/:id", zValidator("param", userIdParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  await UserService.remove(c.var.scope, id);
  return c.body(null, 204);
});

router.patch(
  "/:id/activate",
  zValidator("param", userIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    return c.json(await UserService.toggleActive(c.var.scope, id));
  },
);

export default router;
