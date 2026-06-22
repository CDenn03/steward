# Steward — Financial Governance Platform

> Trusted stewardship platform for faith-based organizations, non-profits, and community groups.

---

## Quick Start

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9 — install with `npm install -g pnpm`
- PostgreSQL database (local, [Neon](https://neon.tech), [Supabase](https://supabase.com), etc.)

### 1. Install dependencies
```bash
pnpm install
# This also runs `prisma generate` automatically via postinstall
```

### 2. Configure environment
```bash
cp .env.example .env.local
```
Open `.env.local` and set at minimum:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/steward"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
```

### 3. Set up the database
```bash
# Apply schema migrations
pnpm db:migrate

# Seed with sample data (Grace Community Church)
pnpm db:seed
```

Or do all three in one:
```bash
pnpm db:setup   # generate + migrate + seed
```

### 4. Run the dev server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to `/dashboard`.

---

## Using Neon (serverless Postgres)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy your connection strings
3. In `.env.local`:
   ```
   DATABASE_URL="postgres://...?pgbouncer=true&sslmode=require"
   DIRECT_URL="postgres://...?sslmode=require"
   ```
4. In `prisma/schema.prisma`, uncomment `directUrl`:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")   # ← uncomment this
   }
   ```

### Approval workflow
```
Draft → Submitted → Finance Review → Chair Approval → Approved
                         ↓
                   Needs Changes → back to Draft
```

### Permissions
Role-based groupings with fine-grained permissions. See `src/lib/auth/permissions.ts`.

| Role           | Key permissions |
|----------------|-----------------|
| Admin          | Everything |
| Chairperson    | Final budget approval, analytics |
| Finance        | Review budgets, manage accounts, approve disbursements |
| Dept Head      | Create/submit budgets, upload receipts |
| Member         | Upload receipts |

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Apply migrations (dev) |
| `pnpm db:migrate:prod` | Apply migrations (production) |
| `pnpm db:seed` | Seed sample data |
| `pnpm db:setup` | generate + migrate + seed |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:reset` | Reset database (⚠️ destructive) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon recommended) |
| ORM | Prisma 6 |
| Auth | Auth.js v5 (setup instructions in `src/lib/auth/auth.ts`) |
| Storage | Cloudflare R2 (setup in `src/lib/storage/r2.ts`) |
| Email | Resend (setup in `src/lib/email/resend.ts`) |
| Charts | Recharts v3 |
| Package manager | pnpm |

---

## Adding Auth.js

```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

Then follow the comments in `src/lib/auth/auth.ts`.

## Adding file uploads (R2)

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Then follow the comments in `src/lib/storage/r2.ts`.

---

## Deployment

Recommended stack: **Vercel** + **Neon** + **Cloudflare R2** + **Resend**

```bash
# Production migration (safe, never resets data)
pnpm db:migrate:prod

# Build
pnpm build
```

Set all env vars from `.env.example` in your Vercel project settings.
