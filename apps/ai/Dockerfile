FROM oven/bun:1.3

WORKDIR /tickzap

# copy manifests
COPY package.json bun.lock* ./
COPY apps/ai/package.json apps/ai/

# install deps
RUN bun install --filter ai

# copy ai
COPY apps/ai apps/ai

EXPOSE 3003

CMD ["bun", "run", "dev:ai"]
