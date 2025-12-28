FROM node:24-slim

# install ssl apk
RUN apt-get update -y \
    && apt-get install -y openssl

RUN corepack enable pnpm

WORKDIR /tickzap

# copy manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/api/prisma apps/api/prisma

# install deps
RUN pnpm install --filter api...

# copy api
COPY apps/api apps/api

EXPOSE 3000

CMD ["pnpm", "--filter", "api", "dev"]
