# Infra e execução do projeto

Monorepo com Bun workspaces: `apps/api` (backend) e `apps/web` (frontend).

## Stack

- **Runtime**: Bun
- **API**: Express 5, Drizzle ORM, PostgreSQL
- **Frontend**: React (Vite)
- **Infra**: Docker Compose (api, frontend, database, redis, minio)

## Desenvolvimento

O ambiente roda via `docker compose up`. Os containers montam volumes dos fontes do host:

```yaml
# api — monta src e .env
volumes:
  - ./apps/api/src:/tickzap/apps/api/src
  - ./apps/api/.env:/tickzap/apps/api/.env
```

O entrypoint da API é `bun run dev:api` que executa `bun --watch src/index.ts` — qualquer alteração em arquivos `.ts`
dentro de `src/` é recarregada automaticamente.

**`docker compose build api` só é necessário quando mudar dependências** (`package.json` ou `bun.lock`). Para mudanças
em código, o watch do Bun já recarrega. Fluxo quando adicionar/remover deps:

1. Editar `apps/api/package.json`
2. Rodar `bun install` no host (atualiza `bun.lock` na raiz do monorepo)
3. `docker compose build api` (deps são instaladas no build da imagem)
4. `docker compose up -d api`
