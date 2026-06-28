import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";

// Workaround: Bun 1.3 interpreta o path da URL como Unix socket (oven-sh/bun#27713).
// Parseia a URL manualmente e remove DATABASE_URL pra evitar override automático.
const dbUrl = new URL(process.env.DATABASE_URL!);
delete process.env.DATABASE_URL;

const client = new SQL({
  hostname: dbUrl.hostname,
  port: Number(dbUrl.port) || 5432,
  username: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.slice(1),
});

export const db = drizzle({ client });
