# PSX Portfolio Management App

Monorepo foundation for a PSX portfolio tracker with a Next.js frontend, NestJS
API, PostgreSQL, and Prisma.

## Project structure

```text
backend/     NestJS REST API and Prisma schema
frontend/    Next.js App Router web application
docs/        Product and functional specifications
scripts/     Local development helpers
index.js     Existing standalone PSX scraper (preserved during migration)
```

## Local prerequisites

- Node.js 22+
- PostgreSQL on `localhost:5432`
- Local PostgreSQL user/password: `postgres` / `postgres`, or update the local
  environment files for your setup

## First-time setup

```powershell
npm install
npm run db:create
npm run db:migrate -- --name init
```

## Run locally

Open two terminals:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

- Frontend: `http://localhost:3000`
- API health: `http://localhost:4000/api/v1/health`
- Swagger UI: `http://localhost:4000/api/docs`
- Swagger JSON: `http://localhost:4000/api/docs-json`

## Quality commands

```powershell
npm run lint
npm test
npm run build
```

## Database commands

```powershell
npm run db:migrate -- --name migration_name
npm run db:studio --workspace backend
npm run db:generate --workspace backend
```

The application uses the local `psx_portfolio` database. The pre-existing `psx`
database remains available to the standalone scraper until its ingestion logic is
moved into the backend market-data module.
