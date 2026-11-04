import { afterEach, describe, expect, test } from "bun:test";
import { eq, inArray } from "drizzle-orm";
import app from "@/index";
import { db } from "@/db/drizzle";
import { requester, session, tenant, ticket, user } from "@/db/schema";

// Execute no container: bun test src/modules/tenant/tenant.integration.test.ts
// Usa o banco configurado em DATABASE_URL e remove somente suas próprias fixtures.
const fixtureNames: string[] = [];

function tenantInput() {
  const name = `tenant-review-test-${crypto.randomUUID()}`;
  fixtureNames.push(name);
  return { name, documentType: "CNPJ", documentNumber: "12345678000190" };
}

async function createAuthenticatedTenant() {
  const [organization] = await db.insert(tenant).values(tenantInput()).returning();
  const [agent] = await db.insert(user).values({
    name: "Agente de teste",
    email: `${crypto.randomUUID()}@example.invalid`,
    password: "unused-session-fixture",
    tenantId: organization.id,
  }).returning();
  const token = crypto.randomUUID();
  const [login] = await db.insert(session).values({
    token: new Bun.CryptoHasher("sha256").update(token).digest("hex"),
    userId: agent.id,
    tenantId: organization.id,
    expiresAt: new Date(Date.now() + 60_000),
  }).returning();

  return {
    organization,
    agent,
    login,
    headers: { cookie: `tickzap.session_token=${token}` },
  };
}

afterEach(async () => {
  if (!fixtureNames.length) return;
  const organizations = await db.select({ id: tenant.id }).from(tenant)
    .where(inArray(tenant.name, fixtureNames));
  const ids = organizations.map(({ id }) => id);
  if (ids.length) {
    // Limpeza explícita funciona mesmo enquanto a cascata está incorreta.
    await db.delete(ticket).where(inArray(ticket.tenantId, ids));
    await db.delete(requester).where(inArray(requester.tenantId, ids));
    await db.delete(session).where(inArray(session.tenantId, ids));
    await db.delete(user).where(inArray(user.tenantId, ids));
    await db.delete(tenant).where(inArray(tenant.id, ids));
  }
  fixtureNames.length = 0;
});

describe("regressões de isolamento e ciclo de vida dos tenants", () => {
  test("ponto 1: usuário autenticado lista apenas seu próprio tenant", async () => {
    const current = await createAuthenticatedTenant();
    const [other] = await db.insert(tenant).values(tenantInput()).returning();

    const response = await app.request("/tenant", { headers: current.headers });

    expect(response.status).toBe(200);
    const body = await response.json() as { id: string }[];
    // Comparações booleanas evitam imprimir dados de tenants preexistentes.
    expect(body.some(({ id }) => id === current.organization.id)).toBe(true);
    expect(body.some(({ id }) => id === other.id)).toBe(false);
    expect(body.every(({ id }) => id === current.organization.id)).toBe(true);
  });

  test("ponto 2: usuário comum não pode provisionar um tenant", async () => {
    const current = await createAuthenticatedTenant();
    const input = tenantInput();

    const response = await app.request("/tenant", {
      method: "POST",
      headers: { ...current.headers, "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const created = await db.select({ id: tenant.id }).from(tenant)
      .where(eq(tenant.name, input.name));

    // Aceita também a remoção da rota enquanto o provisionamento é manual.
    expect([403, 404, 405].includes(response.status)).toBe(true);
    expect(created).toHaveLength(0);
  });

  test("ponto 4: excluir tenant remove seus dependentes e preserva outro tenant", async () => {
    const current = await createAuthenticatedTenant();
    const other = await createAuthenticatedTenant();

    async function createTicket(tenantId: string) {
      const [contact] = await db.insert(requester).values({
        tenantId,
        name: "Contato de teste",
        contactValue: "contact@example.invalid",
        contactType: "email",
        companyName: "Empresa de teste",
        identifierValue: "12345678901",
        identifierType: "CPF",
      }).returning();
      const [issue] = await db.insert(ticket).values({
        tenantId,
        requesterId: contact.id,
        title: "Ticket de teste",
        description: "Verificação da exclusão em cascata",
        status: "open",
      }).returning();
      return { contact, issue };
    }

    const removed = await createTicket(current.organization.id);
    const preserved = await createTicket(other.organization.id);

    await db.delete(tenant).where(eq(tenant.id, current.organization.id));

    expect(await db.select({ id: tenant.id }).from(tenant)
      .where(eq(tenant.id, current.organization.id))).toHaveLength(0);
    expect(await db.select({ id: tenant.id }).from(tenant)
      .where(eq(tenant.id, other.organization.id))).toHaveLength(1);

    for (const [table, removedId, preservedId] of [
      [user, current.agent.id, other.agent.id],
      [session, current.login.id, other.login.id],
      [requester, removed.contact.id, preserved.contact.id],
      [ticket, removed.issue.id, preserved.issue.id],
    ] as const) {
      expect(await db.select({ id: table.id }).from(table)
        .where(eq(table.id, removedId))).toHaveLength(0);
      expect(await db.select({ id: table.id }).from(table)
        .where(eq(table.id, preservedId))).toHaveLength(1);
    }
  });
});
