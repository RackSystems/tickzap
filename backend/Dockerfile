ARG NODE_VERSION=22.16.0

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app
EXPOSE 3000

FROM base AS dev
# Install dependencies
COPY ./package*.json ./
RUN npm install

# Copy application code
COPY ./ .
RUN npx prisma generate

CMD ["npm", "run", "dev"]
