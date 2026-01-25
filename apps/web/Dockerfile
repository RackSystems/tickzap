FROM oven/bun:1.3

WORKDIR /tickzap

# copy manifests
COPY package.json bun.lock* ./
COPY apps/web/package.json apps/web/

# install deps
RUN bun install --filter web

# copy web
COPY apps/web apps/web

EXPOSE 5173

CMD ["bun", "run", "dev:web"]
