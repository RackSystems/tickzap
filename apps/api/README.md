To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

Migrations
```
bunx drizzle-kit generate --name=initial_schema
bunx drizzle-kit check
bunx drizzle-kit migrate

```

Seed
```
bun --env-file=/apps/api/.env run /apps/api/src/db/seed.ts
```

open http://localhost:3000