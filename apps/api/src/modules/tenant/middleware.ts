import { createMiddleware } from "hono/factory";
import type { AuthEnv } from "@/modules/auth/middleware";
import { tenantScope, type TenantScope } from "./tenant-scope";

export type TenantEnv = {
  Variables: AuthEnv["Variables"] & {
    scope: TenantScope;
  };
};

// Deve rodar depois de `requireAuth`. O tenant vem sempre da sessão, nunca do
// request; `AuthService.getSession` já garante que ele está ativo e que
// coincide com o tenant do usuário.
export const requireTenant = createMiddleware<TenantEnv>(async (c, next) => {
  c.set("scope", tenantScope(c.var.session.tenantId));
  await next();
});
