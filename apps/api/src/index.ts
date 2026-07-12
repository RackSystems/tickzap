import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { DomainError } from "@/shared/errors";
import authRouter from "@/modules/auth/routes";
import {
  getTrustedOrigins,
  requireTrustedOrigin,
} from "@/modules/auth/middleware";
import userRouter from "@/modules/users/routes";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: getTrustedOrigins(),
    credentials: true,
  }),
);
app.use("*", requireTrustedOrigin);

app.onError((err, c) => {
  if (err instanceof DomainError) {
    return c.json({ message: err.message }, err.status as ContentfulStatusCode);
  }

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  console.error(err);
  return c.json({ message: "Internal Server Error" }, 500);
});

app.notFound((c) => {
  return c.json({ message: "Not Found" }, 404);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/auth", authRouter);
app.route("/users", userRouter);

export default app;
