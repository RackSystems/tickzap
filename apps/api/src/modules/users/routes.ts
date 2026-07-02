import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as UserService from "./user.service";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userQuerySchema,
} from "./user.schema";

const router = new Hono();

router.get("/", zValidator("query", userQuerySchema), async (c) => {
  return c.json(await UserService.list(c.req.valid("query")));
});

router.get("/:id", zValidator("param", userIdParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  return c.json(await UserService.getById(id));
});

router.post("/", zValidator("json", createUserSchema), async (c) => {
  return c.json(await UserService.create(c.req.valid("json")), 201);
});

router.put(
  "/:id",
  zValidator("param", userIdParamSchema),
  zValidator("json", updateUserSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    return c.json(await UserService.update(id, c.req.valid("json")));
  },
);

router.delete("/:id", zValidator("param", userIdParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  await UserService.remove(id);
  return c.body(null, 204);
});

router.patch(
  "/:id/activate",
  zValidator("param", userIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    return c.json(await UserService.toggleActive(id));
  },
);

export default router;
