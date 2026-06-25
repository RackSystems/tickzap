# TickZap — Backlog de Engenharia (API)

> Dívida técnica, correções e hardening da `apps/api`. Documento técnico, separado do
> [ROADMAP.md](ROADMAP.md) (que é visão de produto). Levantado na análise estrutural de jun/2026.
>
> Decisão de arquitetura: **manter Express 5 + Bun** (sem migrar para NestJS), apenas reorganizar
> em módulos por domínio. Formatação Prettier é incremental (por módulo migrado), sem commit em massa.

## 🔴 Crítico — segurança e correção

- [ ] **#1 Autenticação real (sessão/JWT)** — `app/middlewares/authMiddleware.ts` confia num cookie `userId` em texto puro, sem assinatura: qualquer um forja identidade enviando `Cookie: userId=xxx`. Trocar por sessão no Redis ou JWT com refresh, cookie httpOnly/assinado/secure. Ajustar `AuthController`, `authMiddleware` e a auth do WebSocket. Corrigir o `maxAge` do cookie (`AuthController.ts` diz "1 dia" mas `3600*1000*1000` ms ≈ 41 dias).
- [ ] **#2 Rotas expostas** — `POST /users` sem `authMiddleware` (qualquer um cria usuário); `POST /webhook/evolution` sem validação de origem (qualquer um injeta mensagens e dispara o agente de IA). Validar token/assinatura da Evolution num middleware dedicado.
- [ ] **#3 ErrorHandler nunca executa** — `app/middlewares/ErrorHandler.ts` tem 3 parâmetros; o Express identifica middleware de erro pela aridade 4 (`err, req, res, next`), então ele nunca captura erros. Adicionar o 4º param e o `return` faltante após o bloco do Prisma (evita "headers already sent"). Logar sem vazar stack. **Blast radius confirmado na migração:** como ele roda como middleware comum no fim da cadeia, dispara `res.status(500)` incondicional — toda rota não encontrada retorna **500 em vez de 404** hoje. Adicionar também um handler de 404 explícito antes do ErrorHandler.
- [ ] **#4 WebSocket via Redis pub/sub** — `websocket.ts` guarda clientes em `Map` em memória, mas o `worker.ts` é processo separado: os broadcasts do job de IA nunca chegam. Migrar para pub/sub no Redis (elimina o `redis.keys()` O(n) em `broadcastToWatchingTicket` e destrava réplicas). Remover userId mockado hardcoded; reativar init comentado em `index.ts`. *(depende de #1)*
- [ ] **#5 Bugs silenciosos** — `MessageService.ts`: `new HttpException(...)` sem `throw` (erro descartado); `backoff: 5000` sem `attempts` não faz retry (BullMQ default = 1 tentativa); `sendMessage` não retorna a mensagem criada; usa `id: ""` + `@ts-ignore` como placeholder.
- [ ] **#20 Hash de senha exposto** — `GET /users` retorna o hash bcrypt no JSON. Aplicar `omit: { password: true }` (Prisma v7, pode ser global em `config/database.ts`); atenção que `AuthService.authenticate` precisa do hash para `Bun.password.verify`.

## 🟡 Estrutura e escala

- [ ] **#6 Prisma gerado fora do git** — client commitado em `src/config/generated/prisma` (atual) e `prisma/generated/prisma` (cópia stale). Apagar a stale, adicionar ao `.gitignore`, `git rm -r --cached`, garantir `prisma generate` no build/Dockerfile.
- [ ] **#7 Índices e uniques no schema** — sem nenhum `@@index`; adicionar em `Message.ticketId`, `Ticket(contactId, channelId)`, `Ticket.status`, `Contact(remoteJid, channelId)`. Revisar `@unique` globais em `Contact.phone/remoteJid/email` (conflitam com multi-canal → `@@unique([remoteJid, channelId])`). Padronizar `Ticket.UserId` → `userId`.
- [ ] **#8 Paginação no `TicketService.index`** — declara `page/pageSize` mas não usa; retorna todos os tickets com 4 includes. Implementar skip/take + metadados. Corrigir retorno `any[]`.
- [ ] **#9 Ticket fechado no webhook** — `WebhookService` anexa mensagem a qualquer ticket, inclusive CLOSED. Buscar ticket `status != CLOSED`; se não existir, criar. Tratar idempotência (reenvio do webhook → `create` da Message com mesmo id estoura P2002).
- [ ] **#10 WebhookService em handlers tipados** — `handleMessagesUpsert` (~130 linhas, payload `any`) mistura download de mídia, upload S3, persistência, broadcast e fila. Quebrar por evento com payloads tipados (usar `integrations/evolution/Types.ts`). Remover `@ts-ignore`. Reusar `StorageService.uploadMediaToStorage` (hoje duplicado). *(depende de #9)*
- [ ] **#11 Validação de entrada + remover no-ops** — Channels e Messages sem validator; criar seguindo `UserValidator`. Remover `handleValidation` órfão em `tickets/:id` show/destroy.
- [ ] **#12 Observabilidade** — logger estruturado (pino) no lugar de `console.*`; `GET /health` checando Postgres e Redis (Docker/Portainer); opcional Sentry no ErrorHandler.
- [ ] **#13 Hardening do servidor** — graceful shutdown (server, prisma, Redis, BullMQ) em SIGTERM/SIGINT; helmet; rate limit em `/login` e webhook; CORS hardcoded → env.
- [ ] **#14 Validar env com zod** — `config/env.ts` validando tudo na inicialização (hoje `as string` espalhado). Falhar rápido.
- [ ] **#15 Testes** — configurar `bun test`; cobrir `AuthService`, `WebhookService.handleMessagesUpsert`, `MessageService.sendMessage`, `TicketService`. CI (lint + test).
- [ ] **#21 ESLint/Prettier** — corrigir flat config da API (`globals.browser`→`node`, typo `node_module/*`, ignorar `config/generated/**`, `eslint-config-prettier`); `.prettierrc`/`.editorconfig` na raiz; ESLint no `apps/web` (vue); zerar 29 erros; enforcement (lint-staged/CI) **por último**, após todos os módulos formatados.

## 🧹 Limpezas (#16)

- [ ] Enums `MessageStatus/MediaType/MessageType` redeclarados à mão em `MessageService.ts` — importar dos gerados pelo Prisma.
- [ ] Typo `processMidea` → `processMedia` e simplificar o switch (todos os cases iguais).
- [ ] Import com barra dupla `"..//integrations"` em `MessageService.ts`.
- [ ] Funções "todo acho q nao vai usar" em `websocket.ts` — remover se confirmado.
- [ ] `data: any` em `sendMessage` — tipar.
- [ ] `ContactInterface.ts` é código morto (usa-se o tipo `Contact` do Prisma) — apagar; revisar os outros `interfaces/`.
- [ ] `ContactController.update` tem `const { password: _ }` — `Contact` não tem `password`, resíduo do UserController; remover.
- [ ] `ChannelController.destroy` tem `res.status(204)` **sem `.end()`** — requisição fica pendurada até timeout. **Bug real**; corrigir.

## 🔭 Pensar grande

- [ ] **#17 Multi-tenancy + filas** — modelar `Organization/Company` (escopo de tenant em toda query), `Queue/Department` e roles. Decisão de design cara de adiar. (ver Fase 0 do [ROADMAP.md](ROADMAP.md))

---

## #19 Modularização por domínio — progresso

Migração de `app/{controllers,services,validators}` para `src/modules/<domínio>/` (routes + controller + service + validator). Validação por módulo: `tsc --noEmit` + smoke test das rotas.

- [x] **users** (piloto)
- [x] **contacts**
- [x] **channels**
- [x] **agents**
- [x] **tickets** — central, consumido por messages/webhook
- [x] **messages** — absorve `queue` + `job`
- [x] **webhooks** — orquestra vários domínios; #10 depois quebra em handlers
- [x] **storage** — controller + service + StorageInterface
- [x] **auth** — encosta na #1
- [x] `routes/api.ts` virou compositor puro de routers (sem controller/middleware inline)
- [ ] **Próximo passo (shared/):** mover `app/middlewares/`, `app/exceptions/`, `app/integrations/`, `helpers/`, `websocket.ts` e os `interfaces/` ainda usados para `src/shared/` (ou `src/integrations/`), ajustando os `../../app/...` espalhados nos módulos. Remover os `interfaces/` mortos (Contact, Ticket — ver limpezas). Então as pastas `app/controllers` e `app/services` (já vazias) somem.
