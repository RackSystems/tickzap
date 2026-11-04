# API do TickZap

API executada com Bun, Hono, Drizzle ORM e PostgreSQL. Execute os comandos abaixo na raiz do repositório.

## Desenvolvimento

Copie `apps/api/.env.example` para `apps/api/.env`. Para conectar ao PostgreSQL do Compose, use `DATABASE_URL=postgresql://user:secret@database:5432/tickzap`.

```sh
docker compose up -d --build api
```

O container instala as dependências com o lockfile e inicia a API com hot reload em [localhost:3000](http://localhost:3000).

## Validação e formatação

```sh
docker compose exec api bun run lint
docker compose exec api bun run typecheck
docker compose exec api bun run format
```

## Migrações

Gere migrações após alterar o schema, confira a consistência e aplique-as com o banco disponível.

```sh
docker compose exec api bun run db:generate
docker compose exec api bun run db:check
docker compose exec api bun run db:migrate
```

## Dados iniciais

Preencha as variáveis `SEED_*` em `apps/api/.env` e execute após aplicar as migrações.

```sh
docker compose exec api bun run src/db/seed.ts
```

Consulte também [a documentação de infraestrutura](../../docs/INFRA.md).
