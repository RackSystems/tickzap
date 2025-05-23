# TickZap Project

Tickzap

## Prerequisites

- Node.js
- npm

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up the database:
   ```
   npx prisma generate
   npx prisma migrate dev --name init
   ```

## Available Scripts

- `npm run dev`: Runs the server in development mode with hot-reloading
- `npm run build`: Compiles TypeScript to JavaScript
- `npm start`: Runs the compiled JavaScript code

## Database

This project uses Prisma ORM with Postgres. The database schema is defined in `prisma/schema.prisma`.

### Prisma Commands

- `npx prisma generate`: Generates the Prisma client
- `npx prisma migrate dev`: Creates a new migration and applies it
- `npx prisma studio`: Opens the Prisma Studio UI to view and edit data
