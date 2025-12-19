# Copilot Instructions for Budayana

## Project Overview

This is an **Elysia.js** API backend with **better-auth** authentication, using **Prisma** with PostgreSQL. Deployed on **Vercel** with **Bun** runtime.

## Architecture

```
src/
├── index.ts          # Elysia app entry - routes mount here
└── lib/
    ├── auth/         # better-auth configuration
    │   ├── config.ts # Auth setup with Prisma adapter
    │   └── index.ts  # Re-exports auth
    └── db/
        ├── index.ts  # PrismaClient with PrismaPg adapter
        └── prisma/
            ├── schema/     # Multi-file Prisma schema
            └── generated/  # Generated Prisma client (DO NOT EDIT)
```

**Key patterns:**

- Auth routes are mounted at `/api/auth/*` and delegate to `auth.handler(request)`
- Database uses `@prisma/adapter-pg` for Vercel edge compatibility
- Prisma schema is split across files in `src/lib/db/prisma/schema/` (configured in `prisma.config.ts`)

## Developer Workflow

```bash
bun i                  # Install dependencies
vc dev                 # Start dev server (Vercel CLI)
bun run dev            # Alternative: Bun watch mode

# Database commands
bun run db:generate    # Generate Prisma client after schema changes
bun run db:push        # Push schema to database (dev)
bun run db:migrate     # Create migrations (production-ready changes)
bun run db:studio      # Open Prisma Studio GUI
```

## Conventions

### Adding New Routes

Mount on the Elysia app in `src/index.ts` using `.get()`, `.post()`, or `.use()` for grouped routes.

### Database Changes

1. Edit schema files in `src/lib/db/prisma/schema/`
2. Run `bun run db:generate` to regenerate client
3. Run `bun run db:push` (dev) or `bun run db:migrate` (production)

### Auth Models

Auth tables (User, Session, Account, Verification) are defined in `auth.prisma` and managed by better-auth. Use `@@map()` for snake_case table names.

## Environment Variables

Required in `.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `CORS_ORIGIN` - Allowed frontend origin for CORS

## Key Dependencies

| Package              | Purpose                            |
| -------------------- | ---------------------------------- |
| `elysia`             | Web framework (Bun-native)         |
| `better-auth`        | Authentication library             |
| `@prisma/adapter-pg` | Prisma PostgreSQL adapter for edge |
| `@elysiajs/cors`     | CORS middleware                    |
