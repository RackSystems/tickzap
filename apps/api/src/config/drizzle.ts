import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";
import * as relations from "./relations";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...schema, ...relations },
});

export default db;
