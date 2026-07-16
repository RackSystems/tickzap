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
  bun run db:generate -- --name=initial_schema

  bun run db:check

  bun run db:migrate

```

open http://localhost:3000