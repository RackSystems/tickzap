FROM node:24-slim

RUN corepack enable pnpm

WORKDIR /tickzap

# copy manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/

# install deps
RUN pnpm install --filter web...

# copy web
COPY apps/web apps/web

EXPOSE 5173

CMD ["pnpm", "--filter", "web", "dev"]
