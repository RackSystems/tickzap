# Multi-tenancy na API TickZap

## Contexto

A API hoje tem uma tabela `tenants` e `users.tenant_id` (nullable) já migrados
(`drizzle/20260726020355_add_tenant_schema`), mas nada realmente usa isso:
`tenantId` não é selecionado no auth, não existe em `ticket`/`requester`, e
`ticket.service.ts`/`requester.service.ts` não filtram por tenant nenhum —
qualquer usuário autenticado (quando autenticado; `/tickets` e `/requesters`
nem têm `requireAuth` hoje) enxerga todos os dados de todos os tenants.

Isso precisa ser resolvido **antes** de implementar os endpoints de IA
(`modules/ai/suggestions`, hoje só schema/service, sem rota), porque qualquer
prompt de IA que leia tickets/requesters herdaria o mesmo vazamento.

Regra de negócio confirmada: tenant é o limite de isolamento de tudo. Um
`user` (agente de suporte) pertence a um tenant; `requester` é o cliente
daquele tenant que abriu contato; `ticket` liga os dois. Nenhum dado pode
vazar entre tenants — nem leitura, nem escrita.

Decisões já validadas com o parceiro humano:
- Tenant é resolvido via sessão (`user.tenantId`), não por header/subdomínio.
- `requester` e `ticket` ganham coluna `tenantId` direta (não só herdada via
  join) — toda leitura já precisa filtrar por tenant mesmo assim, e a coluna
  direta deixa a invariante explícita e evita joins obrigatórios.
- Provisionamento de tenant: só via seed/admin manual por enquanto.
- Banco de dev pode ser resetado (sem dado real a preservar).
- `modules/users` entra no mesmo escopo (também estava vazando entre tenants).
- Integridade cross-tenant `ticket.requesterId` → `requester`: validação na
  aplicação (não constraint composta no banco).
- Unicidade de email do `user`: continua **global**, não vira composta com
  tenant (login continua só por email, sem seleção de tenant).
- Novas FKs `ticket.tenantId`/`requester.tenantId`: `onDelete: "cascade"`,
  espelhando `user.tenantId`.

## Fluxo de escopo (estado alvo)

```
Request
  → cors
  → requireTrustedOrigin
  → requireAuth                    (valida cookie, carrega user + session)
       user agora sempre tem tenantId (NOT NULL)
  → handler lê c.var.user.tenantId (sem variável de contexto nova)
  → service(tenantId, ...)
       insert → grava tenantId
       select → where tenantId = ctx.tenantId AND ...
  → erro "não encontrado" (404) se o recurso existe mas é de outro tenant
```

## Modelo de dados alvo

```
tenant (1) ──< user            tenantId NOT NULL, cascade   [migrar: era nullable]
tenant (1) ──< requester        tenantId NOT NULL, cascade   [novo]
tenant (1) ──< ticket           tenantId NOT NULL, cascade   [novo]
requester (1) ──< ticket        requesterId (já existe; validado por app, não FK composta)
```

## Fases

### Fase 0 — Reset do banco de dev
`user.tenantId` vai virar `NOT NULL`; o seed atual força `tenantId: null` na
linha existente, então a migration quebraria contra dado órfão. Resetar antes
evita backfill descartável:
- `docker compose down -v` (derruba o volume) e sobe de novo — mais simples
  e já é o padrão de "posso resetar" combinado.

### Fase 1 — Schema
- `src/db/schema/user.sql.ts`: `tenantId` passa a `.notNull()` (mantém FK
  `cascade` já existente). Índice `user_email_key` **sem mudança** (fica
  global).
- `src/db/schema/ticket.sql.ts`: adicionar `tenantId: uuid("tenant_id").notNull().references(() => tenant.id, { onDelete: "cascade" })`.
- `src/db/schema/requester.sql.ts`: mesma adição de `tenantId`.
- `src/db/schema/tenant.sql.ts` e `session.sql.ts`: sem mudança.

### Fase 2 — Migration
- `bun run db:generate` (drizzle-kit generate) → novo diretório em `drizzle/`.
- Revisar o SQL gerado (conferir `NOT NULL` + FK cascade nas 3 colunas).
- `bun run db:check` e `bun run db:migrate`.

### Fase 3 — Seed (`src/db/seed.ts`)
- Nova env var obrigatória (ex.: `SEED_TENANT_NAME`).
- Buscar/criar o tenant via `db.insert(tenant).values({ name }).returning()`
  (idempotente por nome, mesmo padrão do check de usuário existente já
  presente no arquivo).
- Passar `tenant.id` para `f.default({ defaultValue: tenantId })` na coluna
  `tenantId` do `seed(db, { users: user }, ...)`, substituindo o
  `defaultValue: null` atual.

### Fase 4 — Auth
- `src/modules/auth/auth.service.ts`: incluir `tenantId: user.tenantId` em
  `sessionUserColumns`. Tipo `SessionUser` já inclui o campo automaticamente
  assim que o schema for NOT NULL — só falta selecioná-lo em runtime.
- `src/modules/auth/middleware.ts`: nenhuma variável de contexto nova; ler
  `c.var.user.tenantId` diretamente nos handlers (evita duas fontes de
  verdade). `AuthEnv` não muda de tipo.

### Fase 5 — Errors
- Novo `src/modules/tickets/ticket.errors.ts`: `TicketNotFoundError` (404).
- Novo `src/modules/requesters/requester.errors.ts`: `RequesterNotFoundError` (404).
- Padrão idêntico a `user.errors.ts` (`extends DomainError`, `readonly status`,
  mensagem pt-br, `this.name`).
- Toda busca por id já filtra por `and(eq(id,...), eq(tenantId,...))` na
  própria query — nunca buscar sem tenant e depois comparar, para não deixar
  brecha de um `if` esquecido.

### Fase 6 — Services
Convenção: `tenantId` como primeiro parâmetro posicional em toda função,
mesmo estilo de `user.service.ts` (`update(id, data)` → agora
`update(tenantId, id, data)`).

- `ticket.service.ts`:
  - `getByID(tenantId, id)` — filtra por tenant, lança `TicketNotFoundError`.
  - `create(tenantId, data)` — antes do insert, busca o requester por
    `(id: data.requesterId, tenantId)`; se não achar, `RequesterNotFoundError`;
    insere já com `tenantId`.
  - `list(tenantId, query)` — `eq(ticket.tenantId, tenantId)` como condição
    obrigatória (não opcional) dentro do `and(...)`.
- `requester.service.ts`:
  - `create(tenantId, data)` — inclui `tenantId` no insert.
  - `list(tenantId, query)` — `eq(requester.tenantId, tenantId)` obrigatório.
  - Novo `getByID(tenantId, id)` (não existe hoje) — necessário para a
    validação cross-tenant do `ticket.service.create` acima.
- `user.service.ts` (escopo confirmado):
  - `getById`, `list`, `update`, `remove`, `toggleActive` passam a receber
    `tenantId` e filtrar por ele.
  - `existsByEmail`/checagem de unicidade em `create`/`update` **continua
    global** (não filtra por tenant) — é a exceção deliberada por causa da
    decisão de manter o índice de email global; vale um comentário no código
    marcando isso como intencional.

### Fase 7 — Routes
- `src/modules/tickets/routes.ts` e `src/modules/requesters/routes.ts`:
  adicionar `router.use("*", requireAuth)` (removendo o
  `// router.use()` comentado em tickets) e passar
  `c.var.user.tenantId` como primeiro argumento em toda chamada de service.
- `src/modules/users/routes.ts`: já tem `requireAuth`; só passa a repassar
  `tenantId` para o service em cada handler.

### Fase 8 — Verificação manual
1. Reset + seed; login com o usuário seedado; confirmar cookie de sessão.
2. Criar `requester` e `ticket` via API autenticada; confirmar em `list`.
3. Rodar o seed uma segunda vez com env vars diferentes (segundo tenant/user);
   logar como o segundo usuário; confirmar que `GET /tickets` e
   `GET /requesters` **não** retornam dados do primeiro tenant.
4. Tentar criar um ticket apontando para `requesterId` de outro tenant →
   esperar 404 `RequesterNotFoundError`.
5. Confirmar que `/users` também não vaza entre tenants (mesmo módulo passou
   a ser escopado por tenant nesta leva).

## Observações fora do escopo (não mexer agora)
- `ilike(ticket.tags, ...)` em `ticket.service.ts::list` filtra um campo
  `jsonb` com `ilike` — provavelmente já quebra em runtime hoje; bug
  pré-existente, não relacionado a tenant, não faz parte deste plano.
- `ticket.service.getByID` existe mas não está ligado a nenhuma rota
  (`GET /:id` não existe em `tickets/routes.ts`) — fica pronto e tenant-safe
  após a Fase 6, mas criar a rota em si não está neste plano a menos que
  peçam.

## Critical files
- `src/db/schema/user.sql.ts`, `ticket.sql.ts`, `requester.sql.ts`
- `src/db/seed.ts`
- `src/modules/auth/auth.service.ts`, `middleware.ts`
- `src/modules/tickets/ticket.service.ts`, `routes.ts` (+ novo `ticket.errors.ts`)
- `src/modules/requesters/requester.service.ts`, `routes.ts` (+ novo `requester.errors.ts`)
- `src/modules/users/user.service.ts`, `routes.ts`
