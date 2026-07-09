# Infra e execução do projeto

O repositório mantém `apps/api` e `apps/web` como projetos Bun independentes.

## Stack

- **Runtime**: Bun
- **API**: Hono, Drizzle ORM, PostgreSQL
- **Frontend**: Vue (Vite)
- **Infra**: Docker Compose (api, frontend, database, redis, minio)

## Desenvolvimento

O ambiente roda via `docker compose up`.

Cada app tem seu próprio `package.json`, `bun.lock` e contexto Docker.
