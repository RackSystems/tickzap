# API Layer — Guia de Implementação

**Etapa**: Sprint 1 — API  
**Status**: Pendente  
**Pré-requisitos**: `hono`, `zod` instalados

---

## Endpoints a implementar

```
POST /api/v1/:tenantId/process
GET  /api/v1/:tenantId/knowledge-base
POST /api/v1/:tenantId/feedback
GET  /api/v1/:tenantId/analytics
```

---

## Estrutura de arquivos após essa etapa

```
src/
├── api/
│   ├── handlers/                     ← pasta nova
│   │   ├── processTicket.ts          ← novo
│   │   ├── getKnowledgeBase.ts       ← novo
│   │   ├── submitFeedback.ts         ← novo
│   │   └── getAnalytics.ts           ← novo
│   └── routes.ts                     ← atualizar
├── types/
│   ├── ticket.ts                     ← novo
│   ├── tenant.ts                     ← novo
│   └── index.ts                      ← atualizar
└── index.ts                          ← atualizar
```

---

## Passo 1 — Tipos (`src/types/ticket.ts`)

Schema Zod do ticket que chega no body do POST `/process`:

```typescript
import { z } from "zod";

export const ticketSchema = z.object({
  id: z.string(),
  description: z.string(),
  customerFeedback: z.string().optional(),
});

export type Ticket = z.infer<typeof ticketSchema>;
```

---

## Passo 2 — Tipos (`src/types/tenant.ts`)

Tipo do tenantId extraído da URL:

```typescript
export type TenantId = string;
```

---

## Passo 3 — Atualizar (`src/types/index.ts`)

Re-exportar todos os tipos:

```typescript
export * from "./ticket";
export * from "./tenant";
```

---

## Passo 4 — Handler: Process Ticket (`src/api/handlers/processTicket.ts`)

Valida o body e retorna stub. A lógica real com o agente vem depois.

```typescript
import type { Context } from "hono";
import { ticketSchema } from "../../types";

export async function processTicketHandler(c: Context) {
  const tenantId = c.req.param("tenantId");
  const body = await c.req.json();

  const result = ticketSchema.safeParse(body);

  if (!result.success) {
    return c.json({ error: result.error.flatten() }, 400);
  }

  const ticket = result.data;

  // TODO: chamar TenantAgentManager aqui
  return c.json({
    ticketId: ticket.id,
    tenantId,
    status: "received",
  });
}
```

---

## Passo 5 — Handler: Knowledge Base (`src/api/handlers/getKnowledgeBase.ts`)

```typescript
import type { Context } from "hono";

export async function getKnowledgeBaseHandler(c: Context) {
  const tenantId = c.req.param("tenantId");

  // TODO: buscar knowledge base do tenant no banco
  return c.json({
    tenantId,
    items: [],
  });
}
```

---

## Passo 6 — Handler: Submit Feedback (`src/api/handlers/submitFeedback.ts`)

```typescript
import type { Context } from "hono";
import { z } from "zod";

const feedbackSchema = z.object({
  ticketId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function submitFeedbackHandler(c: Context) {
  const tenantId = c.req.param("tenantId");
  const body = await c.req.json();

  const result = feedbackSchema.safeParse(body);

  if (!result.success) {
    return c.json({ error: result.error.flatten() }, 400);
  }

  // TODO: persistir feedback no banco
  return c.json({
    tenantId,
    received: true,
  });
}
```

---

## Passo 7 — Handler: Analytics (`src/api/handlers/getAnalytics.ts`)

```typescript
import type { Context } from "hono";

export async function getAnalyticsHandler(c: Context) {
  const tenantId = c.req.param("tenantId");

  // TODO: buscar métricas reais do banco
  return c.json({
    tenantId,
    metrics: {},
  });
}
```

---

## Passo 8 — Rotas (`src/api/routes.ts`)

Registrar todos os handlers nas rotas:

```typescript
import { Hono } from "hono";
import { processTicketHandler } from "./handlers/processTicket";
import { getKnowledgeBaseHandler } from "./handlers/getKnowledgeBase";
import { submitFeedbackHandler } from "./handlers/submitFeedback";
import { getAnalyticsHandler } from "./handlers/getAnalytics";

const routes = new Hono();

routes.post("/:tenantId/process", processTicketHandler);
routes.get("/:tenantId/knowledge-base", getKnowledgeBaseHandler);
routes.post("/:tenantId/feedback", submitFeedbackHandler);
routes.get("/:tenantId/analytics", getAnalyticsHandler);

export default routes;
```

---

## Passo 9 — Entry point (`src/index.ts`)

Registrar as rotas no app principal com prefixo `/api/v1`:

```typescript
import { Hono } from "hono";
import routes from "./api/routes";

const app = new Hono();

app.route("/api/v1", routes);

export default {
  port: 3003,
  fetch: app.fetch,
};
```

---

## Verificação

Após implementar, teste com curl ou Postman:

```bash
# POST /process
curl -X POST http://localhost:3003/api/v1/tenant-123/process \
  -H "Content-Type: application/json" \
  -d '{"id": "ticket-1", "description": "Meu produto não chegou"}'

# GET /knowledge-base
curl http://localhost:3003/api/v1/tenant-123/knowledge-base

# POST /feedback
curl -X POST http://localhost:3003/api/v1/tenant-123/feedback \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "ticket-1", "rating": 4}'

# GET /analytics
curl http://localhost:3003/api/v1/tenant-123/analytics
```

---

## O que NÃO entra nessa etapa

- Lógica real nos handlers (agentes, LLM)
- Middleware de autenticação (API key)
- Integração com banco de dados
- Error handler global

---

## Próxima etapa após concluir

- Middleware de auth (`src/api/middleware/auth.ts`)
- Error handler global (`src/api/middleware/errorHandler.ts`)
- Integração com `TenantAgentManager` no handler de process
