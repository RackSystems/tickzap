# -------- stage deps --------
FROM oven/bun:1.3 AS deps

WORKDIR /apps/web

COPY package.json bun.lock* ./

RUN bun install

# -------- stage dev (with hot reload) --------
FROM oven/bun:1.3 as dev

WORKDIR /apps/web

COPY --from=deps /apps/web/node_modules ./node_modules

COPY . .

EXPOSE 5173

CMD ["bun", "run", "dev"]
