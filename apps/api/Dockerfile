# -------- stage deps --------
FROM oven/bun:1.3 AS deps

WORKDIR /apps/api

COPY package.json bun.lock* ./

RUN bun install

# -------- stage dev (with hot reload) --------
FROM oven/bun:1.3 as dev

WORKDIR /apps/api

COPY --from=deps /apps/api/node_modules ./node_modules

COPY . .

EXPOSE 3000

CMD ["bun", "run", "dev"]
