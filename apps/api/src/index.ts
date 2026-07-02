import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { DomainError } from "@/shared/errors";
import userRouter from "@/modules/users/routes";

const app = new Hono();

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

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/users", userRouter);

export default app;
