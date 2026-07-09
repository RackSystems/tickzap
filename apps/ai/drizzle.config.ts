import "dotenv/config"
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/services/database/schema",
  out: "./src/services/database/migrations",
  strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
