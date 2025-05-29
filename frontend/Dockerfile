ARG NODE_VERSION=22.16.0

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app
EXPOSE 5173

FROM base AS dev
# Install dependencies
COPY ./package*.json ./
RUN npm install

# Copy application code
COPY ./ .

CMD ["npm", "run", "dev"]
