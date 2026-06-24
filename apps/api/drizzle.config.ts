import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/config/schema",
  out: "./src/config/drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
