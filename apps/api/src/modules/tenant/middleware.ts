import {createMiddleware} from "hono/factory";
import {Session, SessionUser} from "@/modules/auth/auth.service";
import {UnauthenticatedError} from "@/modules/auth/auth.errors";

type TenantEnv = {
  Variables: {
    user: SessionUser,
    session: Session,
    tenant: string,
  };
};

export const requireTenant = createMiddleware<TenantEnv>(async (c, next) => {
  const { user, session } = c.var;

  if (user.tenantId !== session.tenantId) {
    throw new UnauthenticatedError();
  }

  c.set("tenant", session.tenantId);
  await next();
});