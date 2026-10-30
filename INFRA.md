# Infra e execução do projeto

O repositório mantém `apps/api` e `apps/web` como projetos independentes.

## Stack

- **Runtime**: Bun
- **API**: Hono, Drizzle ORM, PostgreSQL
- **Frontend**: Vue (Vite)
- **Infra**: Docker

Cada app tem seu próprio `package.json`, `bun.lock`.
