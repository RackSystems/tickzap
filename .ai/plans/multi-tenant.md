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

Decisões já validadas com o parceiro humano na primeira rodada de alinhamento:
- Cada usuário pertence a exatamente um tenant.
- O email do usuário permanece único globalmente.
- O tenant da requisição será derivado do usuário autenticado. Foi proposta a
  criação de um middleware de tenant, aplicado após o middleware de
  autenticação. Ele extrai `tenantId` do usuário autenticado, carrega o tenant,
  valida sua existência e disponibiliza esse contexto para as ações seguintes.
  O middleware estabelece o escopo confiável, mas os services continuam
  responsáveis por aplicar explicitamente `tenantId` em inserts, updates,
  deletes e filtros das consultas Drizzle.
- O seed segue o padrão atual: cria o tenant e usa o id criado em
  `user.tenantId`.
- Como a execução será manual e somente em desenvolvimento, usuários existentes
  com `tenantId = null` serão migrados para o tenant criado, em vez de serem
  descartados por um reset do banco.
- No fluxo normal, um usuário novo é criado dentro do tenant do usuário
  autenticado que realizou o cadastro.
- A possibilidade futura de um administrador criar outros tenants e vincular
  usuários ao tenant desejado depende de roles e permissions e não faz parte
  desta etapa.
- A implementação será incremental:
  1. mínimo necessário para seed, backfill e vínculo obrigatório do tenant com
     todas as tabelas existentes, incluindo os ajustes de escrita necessários
     para a API continuar funcional;
  2. isolamento de todas as consultas por tenant;
  3. integração final com autenticação, roles e permissions.
- `requester` e `ticket` ganham coluna `tenantId` direta (não só herdada via
  join) — toda leitura já precisa filtrar por tenant mesmo assim, e a coluna
  direta deixa a invariante explícita e evita joins obrigatórios.
- Provisionamento de tenant: só via seed/admin manual por enquanto.
- `modules/users` entra no mesmo escopo (também estava vazando entre tenants).
- Integridade cross-tenant `ticket.requesterId` → `requester`: validação na
  aplicação (não constraint composta no banco).
- Unicidade de email do `user`: continua **global**, não vira composta com
  tenant (login continua só por email, sem seleção de tenant).
- `session` também armazena diretamente o `tenantId` do usuário autenticado.
- A introdução das colunas obrigatórias será feita em duas migrations, com o
  seed/backfill executado entre elas.
- O tenant terá `name`, `documentType` e `documentNumber` como campos separados.
  Além do `id`, o par `(name, documentNumber)` será um identificador de negócio
  com constraint única composta.
- Novas FKs `ticket.tenantId`/`requester.tenantId`: `onDelete: "cascade"`,
  espelhando `user.tenantId`.
- A cascata do tenant é unidirecional: excluir um tenant remove todos os seus
  usuários, sessões, requesters e tickets. Excluir uma entidade filha nunca
  remove o tenant nem outras entidades irmãs. A sessão continua sendo
  dependente do usuário e é removida quando o usuário é excluído.

## Fluxo de escopo (estado alvo)

```
Request
  → cors
  → requireTrustedOrigin
  → requireAuth                    (valida cookie, carrega user + session)
       user agora sempre tem tenantId (NOT NULL)
  → requireTenant                  (carrega e valida o tenant da sessão)
       define c.var.tenant
  → handler lê c.var.tenant.id
  → service(tenantId, ...)
       insert → grava tenantId
       select → where tenantId = ctx.tenantId AND ...
  → erro "não encontrado" (404) se o recurso existe mas é de outro tenant
```

## Modelo de dados alvo

```
tenant (1) ──< user            tenantId NOT NULL, cascade   [migrar: era nullable]
tenant (1) ──< session         tenantId NOT NULL             [novo]
tenant (1) ──< requester        tenantId NOT NULL, cascade   [novo]
tenant (1) ──< ticket           tenantId NOT NULL, cascade   [novo]
requester (1) ──< ticket        requesterId (já existe; validado por app, não FK composta)
```

Regras de exclusão:

```
DELETE tenant
  ├─> DELETE users
  │     └─> DELETE sessions do usuário
  ├─> DELETE sessions do tenant
  ├─> DELETE requesters
  └─> DELETE tickets

DELETE user      ──> não altera tenant, requesters ou tickets
DELETE requester ──> não altera tenant, users ou demais requesters
DELETE ticket    ──> não altera tenant, user ou requester
```

## Fases

### Fase 0 — Primeira migration: preparar o backfill
`user.tenantId` vai virar `NOT NULL`; o seed atual força `tenantId: null`, e
`session`, `requester` e `ticket` ainda não possuem essa coluna. A primeira
migration deve:
- manter `users.tenant_id` nullable;
- adicionar `sessions.tenant_id`, `requester.tenant_id` e `ticket.tenant_id`
  como nullables, com suas respectivas FKs;
- permitir que a aplicação execute o seed/backfill antes de impor `NOT NULL`.

Como esta operação será executada manualmente e somente em desenvolvimento:
- criar ou localizar o tenant que receberá os usuários existentes;
- atualizar todos os usuários com `tenantId = null` para esse tenant;
- atualizar todas as sessões, requesters e tickets existentes para o mesmo
  tenant;
- somente depois tornar os quatro vínculos obrigatórios.

O banco não deve ser resetado como parte deste roteiro.

### Fase 1 — Schema
- `src/db/schema/user.sql.ts`: `tenantId` passa a `.notNull()` (mantém FK
  `cascade` já existente). Índice `user_email_key` **sem mudança** (fica
  global).
- `src/db/schema/session.sql.ts`: adicionar `tenantId` obrigatório, preenchido
  com o tenant do usuário no momento da criação da sessão.
- `src/db/schema/ticket.sql.ts`: adicionar `tenantId: uuid("tenant_id").notNull().references(() => tenant.id, { onDelete: "cascade" })`.
- `src/db/schema/requester.sql.ts`: mesma adição de `tenantId`.
- `src/db/schema/tenant.sql.ts`: adicionar `documentType` e `documentNumber` e
  criar índice único composto por `(name, documentNumber)`. O `id` UUID
  continua sendo a chave primária e o par também pode ser usado para localizar
  o tenant.

### Fase 2 — Segunda migration: impor as invariantes
- Após executar o seed/backfill, gerar a segunda migration para tornar
  `users.tenant_id`, `sessions.tenant_id`, `requester.tenant_id` e
  `ticket.tenant_id` obrigatórios.
- Revisar o SQL gerado, conferindo `NOT NULL` e as FKs definidas.
- Rodar `bun run db:check` e `bun run db:migrate` dentro do container.

### Fase 3 — Seed (`src/db/seed.ts`)
- Novas env vars obrigatórias: `SEED_TENANT_NAME`,
  `SEED_TENANT_DOCUMENT_TYPE` e `SEED_TENANT_DOCUMENT_NUMBER`.
- Normalizar `documentNumber` antes da busca e persistência.
- Buscar o tenant pelo par `(name, documentNumber)`; se não existir, criá-lo
  com `name`, `documentType` e `documentNumber`. A constraint única composta
  sustenta a idempotência desse identificador de negócio.
- Se o usuário já existir com `tenantId = null`, vinculá-lo ao tenant criado,
  em vez de encerrar imediatamente como o seed atual.
- Preencher com o tenant criado todos os registros existentes de `session`,
  `requester` e `ticket` cujo `tenantId` ainda seja nulo.
- Passar `tenant.id` para `f.default({ defaultValue: tenantId })` na coluna
  `tenantId` do `seed(db, { users: user }, ...)`, substituindo o
  `defaultValue: null` atual.

### Fase 4 — Auth e contexto mínimo de tenant
- `src/modules/auth/auth.service.ts`: incluir `tenantId: user.tenantId` em
  `sessionUserColumns` e gravá-lo também na nova sessão.
- `src/modules/auth/middleware.ts`: manter `requireAuth` responsável pela
  autenticação e adicionar `requireTenant` depois dele para carregar e validar
  o tenant indicado pela sessão/usuário.
- Adicionar o tenant validado ao contexto Hono. Os handlers passam
  `c.var.tenant.id` aos services; o valor enviado pelo cliente nunca define o
  tenant da operação.

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
  adicionar `router.use("*", requireAuth, requireTenant)` (removendo o
  `// router.use()` comentado em tickets) e passar `c.var.tenant.id` como
  primeiro argumento em toda chamada de service.
- `src/modules/users/routes.ts`: manter `requireAuth`, adicionar
  `requireTenant` e repassar `c.var.tenant.id` ao service em cada handler.

### Fase 8 — Verificação manual
1. Reset + seed; login com o usuário seedado; confirmar cookie de sessão.
2. Criar `requester` e `ticket` via API autenticada; confirmar em `list`.
3. Rodar o seed uma segunda vez com nome, documento e usuário diferentes
   (segundo tenant/user); logar como o segundo usuário; confirmar que
   `GET /tickets` e `GET /requesters` **não** retornam dados do primeiro
   tenant.
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
