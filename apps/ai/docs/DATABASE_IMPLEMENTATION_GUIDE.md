# Database Layer — Guia de Implementação

**Etapa**: Sprint 1 — Database  
**Status**: Pendente  
**Pré-requisitos**: `drizzle-orm`, `drizzle-kit`, `dotenv` instalados

---

## Estrutura de arquivos após essa etapa

```
apps/ai/
├── migrations/                              ← pasta gerada pelo drizzle-kit
│   └── 0001_init.sql                        ← gerado automaticamente
├── src/
│   └── services/
│       └── database/
│           ├── _helpers.ts                  ← novo: helpers de timestamp
│           ├── schema.ts                    ← novo: definição das tabelas
│           ├── client.ts                    ← atualizar
│           └── queries.ts                   ← novo: queries reutilizáveis
└── drizzle.config.ts                        ← corrigir caminho errado
```

---

## Passo 1 — Banco `tickzap_ai`

O serviço AI usa um banco dedicado, isolado do banco da API (`tickzap`). O banco é criado **automaticamente** pelo script `docker/init-db.sh` na primeira vez que o container sobe.

Para verificar:

```bash
docker exec -it tickzap-database-1 psql -U user -d tickzap -c "\l"
# Deve listar: tickzap e tickzap_ai
```

Configure a variável de ambiente no `.env` do serviço AI:

```env
DATABASE_URL=postgresql://user:secret@database:5432/tickzap_ai
```

---

## Passo 2 — Corrigir `drizzle.config.ts`

O arquivo atual aponta para um caminho que não existe. Corrija para:

```typescript
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/services/database/schema.ts",
  out: "./migrations",
  strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

> `strict: true` garante que o drizzle-kit peça confirmação antes de aplicar
> migrations destrutivas (DROP TABLE, DROP COLUMN, etc).

---

## Passo 3 — Helpers de timestamp (`src/services/database/_helpers.ts`)

Crie funções reutilizáveis de timestamp para não repetir em todas as tabelas:

```typescript
import { timestamp } from "drizzle-orm/pg-core";

export const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

export const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date());

export const timestamps = {
  createdAt: createdAt(),
  updatedAt: updatedAt(),
};
```

---

## Passo 4 — Schema (`src/services/database/schema.ts`)

### Regras seguidas

- Tabelas: plural snake_case (`tickets`, `chat_messages`)
- Colunas: snake_case (`tenant_id`, `created_at`)
- IDs: `text` gerado pela aplicação com `crypto.randomUUID()` — nunca `serial`
- Enums: `text` com `$type<>()` TypeScript — nunca `pgEnum`
- JSONB: sempre tipado com interface — nunca `Record<string, unknown>`
- Timestamps: spread do helper `timestamps`

---

### Tabela: `tenant_configs`

Configuração de modelo/provedor por tenant:

```typescript
import { pgTable, text, boolean, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { timestamps } from "./_helpers";

interface ModelConfig {
  provider: "openai" | "anthropic" | "google" | "ollama";
  modelName: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
}

export const tenantConfigs = pgTable(
  "tenant_configs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .notNull(),
    tenantId: text("tenant_id").notNull().unique(),
    modelConfig: jsonb("model_config").$type<ModelConfig>().notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("tenant_configs_tenant_id_idx").on(t.tenantId)],
);

export type NewTenantConfig = typeof tenantConfigs.$inferInsert;
export type TenantConfig = typeof tenantConfigs.$inferSelect;
```

---

### Tabela: `tickets`

Histórico de tickets processados por tenant:

```typescript
export type TicketStatus = "received" | "processing" | "resolved" | "failed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export const tickets = pgTable(
  "tickets",
  {
    id: text("id").primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    description: text("description").notNull(),
    customerFeedback: text("customer_feedback"),
    status: text("status")
      .$type<TicketStatus>()
      .default("received")
      .notNull(),
    priority: text("priority").$type<TicketPriority>(),
    category: text("category"),
    /** Equipe de destino definida pelo agente: nivel1, financeiro, comercial */
    assignedTeam: text("assigned_team"),
    /** Score de satisfação gerado pelo SatisfactionAnalyzerTool (1-5) */
    satisfactionScore: text("satisfaction_score"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("tickets_tenant_id_idx").on(t.tenantId),
  ],
);

export type NewTicket = typeof tickets.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
```

---

### Tabela: `chat_messages`

Histórico de mensagens por sessão (contexto do agente):

```typescript
export type MessageRole = "user" | "assistant" | "system";

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .notNull(),
    tenantId: text("tenant_id").notNull(),
    sessionId: text("session_id").notNull(),
    ticketId: text("ticket_id").references(() => tickets.id, {
      onDelete: "cascade",
    }),
    role: text("role").$type<MessageRole>().notNull(),
    content: text("content").notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("chat_messages_session_id_idx").on(t.sessionId),
    uniqueIndex("chat_messages_tenant_id_idx").on(t.tenantId),
  ],
);

export type NewChatMessage = typeof chatMessages.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
```

---

### Tabela: `audit_logs`

Logs de compliance LGPD — toda operação sensível registrada aqui:

```typescript
export type AuditAction =
  | "ticket_received"
  | "ticket_processed"
  | "pii_sanitized"
  | "llm_called"
  | "feedback_received";

interface AuditMetadata {
  ticketId?: string;
  provider?: string;
  sanitizedFields?: string[];
}

export const auditLogs = pgTable("audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  tenantId: text("tenant_id").notNull(),
  action: text("action").$type<AuditAction>().notNull(),
  /** Dados adicionais sobre a ação — nunca inclui PII */
  metadata: jsonb("metadata").$type<AuditMetadata>(),
  ...timestamps,
});

export type NewAuditLog = typeof auditLogs.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
```

---

## Passo 5 — Atualizar `src/services/database/client.ts`

Passe o schema para o cliente para habilitar type-safety completo:

```typescript
import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";

const db = drizzle(process.env.DATABASE_URL!, { schema });

export default db;
```

---

## Passo 6 — Queries (`src/services/database/queries.ts`)

Funções reutilizáveis que os handlers e agentes chamarão.  
**Regra**: sempre use `db.select()` — nunca `db.query.*` (relational API).

```typescript
import { eq, desc } from "drizzle-orm";
import db from "./client";
import {
  tickets,
  chatMessages,
  tenantConfigs,
  auditLogs,
  type NewTicket,
  type NewChatMessage,
  type NewAuditLog,
} from "./schema";

// --- Tickets ---

export async function saveTicket(ticket: NewTicket) {
  const [saved] = await db.insert(tickets).values(ticket).returning();
  return saved;
}

export async function getTicketById(id: string) {
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, id))
    .limit(1);
  return ticket;
}

// --- Chat Messages ---

export async function getSessionHistory(tenantId: string, sessionId: string) {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(desc(chatMessages.createdAt));
}

export async function saveMessage(message: NewChatMessage) {
  const [saved] = await db.insert(chatMessages).values(message).returning();
  return saved;
}

// --- Tenant Config ---

export async function getTenantConfig(tenantId: string) {
  const [config] = await db
    .select()
    .from(tenantConfigs)
    .where(eq(tenantConfigs.tenantId, tenantId))
    .limit(1);
  return config;
}

// --- Audit Logs ---

export async function saveAuditLog(log: NewAuditLog) {
  const [saved] = await db.insert(auditLogs).values(log).returning();
  return saved;
}
```

---

## Passo 7 — Gerar e aplicar migrations

Com o banco PostgreSQL rodando via docker-compose:

```bash
# 1. Gerar o SQL de migration a partir do schema
bunx drizzle-kit generate

# 2. Revisar o SQL gerado em migrations/
# Sempre revisar antes de aplicar

# 3. Aplicar no banco
bunx drizzle-kit migrate

# 4. (Opcional) Abrir o Drizzle Studio para inspecionar
bunx drizzle-kit studio
```

> Nunca edite os arquivos dentro de `migrations/` manualmente.  
> Para alterar tabelas, edite o `schema.ts` e gere uma nova migration.

---

## Verificação

Após aplicar as migrations, confirme no banco:

```bash
# Conectar no banco dedicado do AI
docker exec -it database psql -U user -d tickzap_ai

# Listar tabelas criadas
\dt

# Deve exibir:
# tenant_configs
# tickets
# chat_messages
# audit_logs
```

---

## O que NÃO entra nessa etapa

- pgvector (embeddings para RAG) — Sprint 3
- Redis para cache de sessões — próxima etapa
- Integração com os handlers da API — próxima etapa após banco pronto

---

## Próxima etapa após concluir

Integrar as queries nos handlers da API:
- `processTicketHandler` → `saveTicket` + `saveAuditLog`
- `getAnalyticsHandler` → queries de agregação
- `TenantAgentManager` → `getTenantConfig` + `getSessionHistory`
