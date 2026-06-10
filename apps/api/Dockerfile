FROM oven/bun:1.3

# install ssl apk
RUN apt-get update -y \
    && apt-get install -y openssl

WORKDIR /tickzap

# copy manifests
COPY package.json bun.lock* ./
COPY apps/api/package.json apps/api/

# install deps
RUN bun install --filter api --verbose

# copy api
COPY apps/api apps/api

RUN bunx prisma generate --schema=apps/api/prisma/schema.prisma

EXPOSE 3000

CMD ["bun", "run", "dev:api"]
