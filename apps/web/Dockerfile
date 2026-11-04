# -------- stage dev (with hot reload) --------
FROM oven/bun:1.4 AS dev

WORKDIR /apps/web

COPY . .

EXPOSE 5173

CMD ["sh", "-c", "bun install --frozen-lockfile && exec bun run dev"]
