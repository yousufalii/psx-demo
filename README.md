# PSX Portfolio

PSX portfolio management monorepo with a Next.js web app, NestJS API,
PostgreSQL/Prisma, and a scheduled market-data scraper.

## Monorepo layout

```text
apps/
  backend/    NestJS REST API and Prisma schema
  frontend/   Next.js App Router web application
  scraper/    PSX scraper and its Docker/AWS deployment files
docs/         Product and functional specifications
```

The repository uses npm workspaces. Dependencies are installed once at the
root, and `package-lock.json` is the only lockfile.

## Requirements

- Node.js 22+
- npm 10+
- PostgreSQL on `localhost:5432`

## First-time setup

```powershell
npm install
npm run db:create
npm run db:migrate -- --name init
```

Copy each app's `.env.example` to `.env` and adjust local credentials where
needed. The default development database is `psx_portfolio`.

## Development

Run the frontend and API together in one terminal with prefixed, live logs:

```powershell
npm run dev
```

For Turbo's interactive terminal UI, where each app's logs can be selected
separately, use:

```powershell
npm run dev:tui
```

Press `Ctrl+C` once to stop all development servers. To run only one app, use
`npm run dev:backend` or `npm run dev:frontend`.

- Frontend: `http://localhost:3000`
- API health: `http://localhost:4000/api/v1/health`
- Swagger UI: `http://localhost:4000/api/docs`

Run the scraper manually with:

```powershell
npm run scraper:start
```

## Quality checks

```powershell
npm run lint
npm test
npm run test:e2e
npm run build
```

## Database commands

```powershell
npm run db:generate
npm run db:migrate -- --name migration_name
npm run db:studio
```

App-specific commands can also be run with a scoped workspace, for example:

```powershell
npm run test --workspace @psx/backend
```
