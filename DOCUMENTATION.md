# Steward — System Documentation
### Version 3 · June 2025

> Steward is a multi-tenant financial governance platform for faith-based organisations, non-profits, and community groups. It governs the complete lifecycle of organisational money: planning budgets, routing them through approval workflows, releasing disbursements, tracking income, and enforcing accountability through receipts and expenditure reports.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Multi-Organisation Architecture](#2-multi-organisation-architecture)
3. [Authentication & Session Flow](#3-authentication--session-flow)
4. [Roles & Permissions](#4-roles--permissions)
5. [Core Domain: Budgets](#5-core-domain-budgets)
6. [Core Domain: Approvals](#6-core-domain-approvals)
7. [Core Domain: Disbursements](#7-core-domain-disbursements)
8. [Core Domain: Expenditure Reports & Receipts](#8-core-domain-expenditure-reports--receipts)
9. [Core Domain: Income](#9-core-domain-income)
10. [Core Domain: Financial Accounts](#10-core-domain-financial-accounts)
11. [Events & Templates](#11-events--templates)
12. [Departments & Allocations](#12-departments--allocations)
13. [Analytics & Dashboards](#13-analytics--dashboards)
14. [Notifications](#14-notifications)
15. [Audit Trail](#15-audit-trail)
16. [Admin Panel](#16-admin-panel)
17. [Developer Setup](#17-developer-setup)
18. [Architecture Reference](#18-architecture-reference)
19. [Database Schema Reference](#19-database-schema-reference)

---

## 1. System Overview

Steward solves a specific governance problem: how does a committee-run organisation manage money transparently when multiple departments, a finance team, and a leadership body all need to plan, approve, spend, and account for the same funds — often concurrently?

The answer is a structured lifecycle with four phases:

```
PLAN                  APPROVE               SPEND                 ACCOUNT
────────────────      ────────────────      ────────────────      ────────────────
Department Head       Finance Officer       Finance releases       Department Head
creates a budget      reviews budget        disbursement           submits receipts
with line items       ↓                     ↓                     ↓
                      Chairperson gives     Department spends      Finance reconciles
                      final approval        money                  receipts against
                                                                   budget lines
```

Every step is logged in an immutable audit trail. The dashboard gives each role a real-time view of the financial state relevant to their responsibilities.

---

## 2. Multi-Organisation Architecture

### Concept

A single Steward installation can serve multiple independent organisations. Each organisation's data is completely isolated from all others. One user (identified by their email address) can be a member of many organisations, with a different role and different department assignment in each.

### Organisation Selection Flow

```
Login (email + password / magic link / Google)
    ↓
Org Picker  (/org-picker)
    — user sees all organisations they belong to
    — each card shows: org name, colour, their role, their department
    ↓
Splash Screen  (/splash/[orgId])
    — full-screen branded transition in the org's primary colour
    — 3 phases: loading → ready (checkmark) → redirect
    — total duration: ~2 seconds
    ↓
Dashboard  (/dashboard)
    — all data scoped to the selected organisation
    — sidebar shows active org with colour badge
```

### Switching Organisations

The org selector in the sidebar opens a dropdown listing all the user's organisations. Selecting a different one triggers the splash screen transition, then loads the new organisation's dashboard. The selection is stored in `sessionStorage` so a page refresh within the same browser tab restores the context automatically.

### Data Isolation

Every database table that holds financial or organisational data includes `organizationId` as a required, indexed foreign key. All service-layer queries are built to always include this filter. It is structurally impossible for a query in one organisation's context to return data from another.

---

## 3. Authentication & Session Flow

### Supported Methods (after Auth.js setup)

| Method | Description |
|--------|-------------|
| Email + Password | Standard credential login |
| Magic Link | Passwordless — a link is emailed and expires in 15 minutes |
| Google OAuth | Single sign-on via Google account |

### Session Context

After authentication, the session carries:
- `userId` — the authenticated user
- `organizationId` — the currently selected organisation
- `role` — the user's role within that organisation
- `departmentId` — the user's department (if applicable)
- `membershipId` — the specific membership record

This context is injected into every Server Action via `requireSession()`, ensuring all mutations are automatically scoped to the correct organisation and actor.

### Invitations

New users join an organisation via an invitation:
1. Admin sends an invite with email, role, and optional department
2. Recipient receives an email with a unique, time-limited token
3. They click the link and create a password (or link Google)
4. They are added to the organisation immediately

Existing Steward users (already in another org) are added directly without needing to create a new account — one email, multiple organisations.

---

## 4. Roles & Permissions

### Role Hierarchy

Steward uses **permission-based access control**. Roles are collections of permissions, not hardcoded behaviours. This makes it easy to adjust what each role can do without touching every page.

| Role | Typical Person |
|------|----------------|
| `admin` | IT or platform administrator — full access |
| `chairperson` | Board chair or committee lead — final approvals and oversight |
| `finance` | Finance officer or treasurer — reviews, accounts, disbursements |
| `department_head` | Ministry or department leader — creates budgets, submits reports |
| `member` | Volunteer or team member — limited to uploading receipts |

### Permission Matrix

| Permission | Member | Dept Head | Finance | Chairperson | Admin |
|------------|:------:|:---------:|:-------:|:-----------:|:-----:|
| `budget.create` | | ✓ | | | ✓ |
| `budget.edit_own` | | ✓ | | | ✓ |
| `budget.submit` | | ✓ | | | ✓ |
| `budget.review` | | | ✓ | ✓ | ✓ |
| `budget.approve_finance` | | | ✓ | | ✓ |
| `budget.approve_chair` | | | | ✓ | ✓ |
| `expenditure.create` | | ✓ | | | ✓ |
| `expenditure.review` | | | ✓ | | ✓ |
| `receipt.upload` | ✓ | ✓ | | | ✓ |
| `income.record` | | | ✓ | | ✓ |
| `account.manage` | | | ✓ | | ✓ |
| `disbursement.create` | | ✓ | | | ✓ |
| `disbursement.approve` | | | ✓ | | ✓ |
| `analytics.view` | | | ✓ | ✓ | ✓ |
| `organization.manage` | | | | ✓ | ✓ |
| `users.manage` | | | | ✓ | ✓ |

### UI Enforcement

The `PermissionGuard` component (`src/components/shared/permission-guard.tsx`) conditionally renders UI elements based on the active role. The nav items shown in the sidebar also vary by role — the Admin section only appears for `admin` users.

---

## 5. Core Domain: Budgets

The budget is the central unit of financial planning in Steward. Every expense should trace back to an approved budget line item.

### Budget States

```
DRAFT
  ↓  (dept head submits)
SUBMITTED
  ↓  (finance approves)          ↓  (finance requests changes)
FINANCE_APPROVED               NEEDS_CHANGES
  ↓  (chair approves)            ↓  (back to dept head to edit and resubmit)
CHAIR_APPROVED ✓
  ↓  (either reviewer rejects at any point)
REJECTED ✗  (terminal — a new budget must be created)
```

### Budget Line Items

Each budget contains one or more line items:

| Field | Description |
|-------|-------------|
| Description | What is being purchased/paid for |
| Category | Transport, Accommodation, Catering, Equipment, etc. |
| Quantity | Number of units |
| Unit Cost | Cost per unit in KES |
| Total Cost | Quantity × Unit Cost (auto-calculated) |
| Notes | Optional justification or detail |

### Budget Revisions

Every time a budget is edited after a `NEEDS_CHANGES` decision, a `BudgetRevision` record is created with a JSON snapshot of the previous state. This means the full history of a budget's changes is always available in the audit trail.

### Budget Categories

Budget categories are configurable per organisation. They can be hierarchical (a parent category with children). Out of the box, Steward seeds these defaults: Transport, Accommodation, Catering, Equipment, Printing & Stationery, Communication, Speaker Fees, Contingency.

---

## 6. Core Domain: Approvals

### Two-Stage Workflow

Every submitted budget requires two independent approvals:

1. **Finance Approval** — The finance officer checks that the budget is financially sound, correctly categorised, and within the department's allocation.
2. **Chairperson Approval** — The chairperson gives final governance sign-off.

Finance approval automatically creates the chairperson approval record. The chairperson cannot approve a budget that has not yet passed finance review.

### Approval Records

Each approval tracks:
- `type` — FINANCE or CHAIRPERSON
- `status` — PENDING, APPROVED, REJECTED, NEEDS_CHANGES
- `reviewerId` — who acted on it
- `comment` — free-text feedback
- `reviewedAt` — timestamp

### Comments

Each approval can have multiple comments attached (`ApprovalComment`). Department heads and reviewers can converse within the budget's comment thread without leaving Steward. This avoids the common problem of approval decisions being made over WhatsApp or email and never being recorded.

---

## 7. Core Domain: Disbursements

A disbursement is a formal, auditable release of funds from a specific account to a department, against a specific approved budget.

### Disbursement States

```
PENDING → APPROVED → RELEASED
                ↓
           CANCELLED  (before release)
```

### Partial Disbursements

An approved budget does not need to be disbursed in a single transaction. Multiple disbursements can be raised against the same budget as spending phases progress:

```
Budget: Youth Annual Camp 2025  (KES 480,000 approved)
  ↓
Disbursement 1: KES 190,000  (deposits — transport + accommodation)
Disbursement 2: KES 249,000  (remaining — catering, speakers, equipment, t-shirts)
Total disbursed: KES 439,000  (KES 41,000 contingency not needed)
```

### Account Impact

When a disbursement is released:
1. The `FinancialAccount.balance` is decremented
2. An `AccountTransaction` debit record is created with the balance after

---

## 8. Core Domain: Expenditure Reports & Receipts

Expenditure reports are the accountability layer — proof that approved, disbursed funds were spent correctly.

### Receipt Allocation Model

Steward uses a **many-to-many** relationship between receipts and budget line items via `ReceiptAllocation`:

```
One receipt → allocated to → many budget line items
  (e.g. a single catering invoice covering "Breakfast Day 1" and "Breakfast Day 2")

One budget line item → supported by → many receipts
  (e.g. "Transport" supported by multiple taxi receipts)
```

This mirrors real-world spending and avoids the common problem of "this receipt doesn't match exactly one line item."

### Expenditure Report States

| Status | Meaning |
|--------|---------|
| `DRAFT` | Being prepared — receipts being uploaded |
| `SUBMITTED` | Sent to finance for review |
| `APPROVED` | Finance verified all receipts — budget is closed out |
| `REJECTED` | Finance rejected — department must revise and resubmit |

### File Storage

Receipt files (PDF, JPEG, PNG) are stored in Cloudflare R2 — not in the database. The database holds only the metadata: `storageKey`, `fileName`, `mimeType`, `size`, `amount`, `vendor`, `receiptDate`. The `storageKey` is used to generate a short-lived signed URL when a reviewer needs to view the file.

### Outstanding Accountability

A budget is considered "outstanding" for accountability purposes when:
- It has been fully approved and at least one disbursement has been released
- No expenditure report with status `APPROVED` exists for it

The "Outstanding Accountability" stat on the dashboard counts these and is one of the key governance indicators.

---

## 9. Core Domain: Income

### Income Categories

| Category | Example |
|----------|---------|
| `TITHE` | Monthly tithe collections |
| `OFFERING` | Sunday service offering |
| `DONATION` | One-off donor gifts |
| `REGISTRATION` | Event registration fees |
| `FUNDRAISING` | Fundraiser proceeds |
| `GRANT` | External funding or grants |
| `OTHER` | Miscellaneous |

### Recording Income

Every income record is linked to:
- A specific financial account (where the money landed)
- A category
- Optional: a department or event

Recording income immediately increments the account balance and creates a credit `AccountTransaction`.

---

## 10. Core Domain: Financial Accounts

### Account Types

| Type | Example |
|------|---------|
| `BANK` | KCB Bank — Main Operating Account |
| `MPESA` | Safaricom M-Pesa Till |
| `CASH` | Petty cash float |
| `SAVINGS` | Equity Bank — Youth Ministry Fund |
| `PROJECT` | Dedicated project ring-fenced account |

### Transaction Ledger

Every balance change — credit or debit — creates an `AccountTransaction` record with:
- Type (credit / debit)
- Amount
- Description
- Balance after the transaction
- Who recorded it

This gives a complete, chronological ledger for every account.

---

## 11. Events & Templates

### Events

Events represent planned activities. They sit at the intersection of planning (budgets) and accountability (income + expenditure reports). An event can be:
- Linked to one or more budgets
- Linked to income records (e.g. registration fees)
- Linked to expenditure reports (post-event accountability)

This gives a complete financial picture of any single activity.

### Recurring Events & Templates

Common recurring events (Annual Camp, Easter Conference, Sunday School Supplies) can be saved as **Event Templates** with:
- Default budget categories
- Standard line items with suggested quantities and unit costs

When creating a new event from a template, all line items are pre-populated. The department head adjusts numbers for the current year rather than rebuilding from scratch. Templates significantly reduce the time-to-submit for well-understood annual activities.

---

## 12. Departments & Allocations

### Department Structure

Each department has:
- A name and optional description
- A designated head (a `Membership` record with role `department_head`)
- An optional annual budget allocation (`DepartmentAllocation`)

### Soft Limits

The allocation is a **soft limit** — the system shows a warning if a proposed budget would exceed the department's remaining allocation, but does not block submission. The finance officer decides during review whether to approve an over-allocation.

This is intentional: hard limits prevent urgent needs from being met. Soft limits create visibility without creating bureaucratic obstacles.

---

## 13. Analytics & Dashboards

### Server-Side Only

All analytics are computed in `src/features/analytics/services/` using Prisma queries, then cached with Next.js `unstable_cache()`. Analytics are never computed in React components. This keeps the UI fast and ensures numbers are consistent regardless of when a component renders.

### Dashboard Views by Role

**Finance Officer**
- Pending Reviews — budgets in the finance queue
- Pending Disbursements — disbursement requests awaiting approval
- Pending Accountability — submitted expenditure reports to review
- Account Balances — real-time balances across all accounts

**Chairperson**
- Organisation Income — total income year-to-date
- Organisation Expenses — total expenditure year-to-date
- Outstanding Accountability — departments with no submitted expenditure reports
- Upcoming Events — events with approved budgets
- Department Utilisation — spend vs. allocation per department
- Budget Variance — approved vs. actual across all budgets

**Department Head**
- My Draft Budgets — budgets in progress
- My Pending Approvals — submitted budgets awaiting review
- My Approved Budgets — active budgets
- My Outstanding Reports — expenditure reports not yet submitted

### Charts

| Chart | Type | Data |
|-------|------|------|
| Department Budget vs Spend | Grouped bar | Allocated vs. spent per department |
| Income Trend | Line | Monthly income by category |
| Budget Allocation | Donut | Budget share by department |
| Budget Variance Report | Table | Allocated, spent, variance, utilisation per budget |

---

## 14. Notifications

### In-App Notifications

Steward maintains a `Notification` table per user. The notification bell in the topbar shows unread count. The Notifications page lists all notifications with read/unread state.

### Email Notifications (via Resend)

After Auth.js and Resend are configured, email notifications fire for:

| Event | Recipient |
|-------|-----------|
| Budget submitted | All Finance Officers in the organisation |
| Finance approved | Department Head + Chairperson |
| Budget needs changes | Department Head |
| Budget finally approved | Department Head + Finance Officers |
| Budget rejected | Department Head |
| Disbursement requested | Finance Officers |
| Disbursement released | Department Head |
| Expenditure report submitted | Finance Officers |
| Expenditure report approved | Department Head |
| Expenditure report needs info | Department Head |
| New user invited | Invitee (email only) |
| Outstanding report reminder | Department heads with overdue reports (weekly) |

---

## 15. Audit Trail

The `AuditLog` table is **append-only**. No update or delete operations are ever run against it. Every meaningful state change in the system writes a record containing:

| Field | Description |
|-------|-------------|
| `actorId` | Who performed the action |
| `entityType` | What kind of record changed (Budget, Income, Receipt…) |
| `entityId` | The specific record |
| `action` | What happened (created, submitted, approved, uploaded…) |
| `before` | JSON snapshot of state before the change |
| `after` | JSON snapshot of state after the change |
| `ipAddress` | Request IP (for security auditing) |
| `createdAt` | Exact timestamp |

The Audit Log page lets admins and finance officers search by entity type, actor, date range, and action. It is read-only by design — there is no mechanism to edit or delete audit records, even for admins.

---

## 16. Admin Panel

The Admin Panel (`/admin/*`) is only accessible to users with the `admin` role.

### User Management (`/admin/users`)

- View all users and their organisation memberships in one place
- Expand any user to see every organisation they belong to with their role and department
- Edit a user's role or department within any organisation
- Remove a user from an organisation
- Invite new users via a two-step modal:
  1. Enter name and email
  2. Assign to one or more organisations with independent role + department per org

### Organisation Management (`/admin/organisations`)

- View all organisations with key stats (member count, approved budgets, liquid assets)
- Create a new organisation with name, slug, and currency
- Access organisation-level settings

---

## 17. Developer Setup

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 — `npm install -g pnpm`
- PostgreSQL database (local, Neon, Supabase, Railway)

### Install

```bash
tar -xzf steward-v3.tar.gz && cd steward
pnpm install
# postinstall runs `prisma generate` automatically
```

### Environment

```bash
cp .env.example .env.local
```

Minimum required:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/steward"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

For Neon, add:

```env
DATABASE_URL="postgresql://...?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://...?sslmode=require"
```

And uncomment `directUrl` in `prisma/schema.prisma`.

### Database

```bash
pnpm db:migrate    # apply schema
pnpm db:seed       # seed two organisations + sample data
pnpm dev           # start dev server at localhost:3000
```

### All Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript check only |
| `pnpm db:generate` | Regenerate Prisma client after schema changes |
| `pnpm db:migrate` | Apply pending migrations (dev) |
| `pnpm db:migrate:prod` | Apply pending migrations (production) |
| `pnpm db:seed` | Seed sample organisations and data |
| `pnpm db:setup` | generate + migrate + seed |
| `pnpm db:studio` | Prisma Studio visual database browser |
| `pnpm db:reset` | ⚠️ Drop and recreate database |

### Enabling Auth.js

```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

Uncomment and configure `src/lib/auth/auth.ts`.

### Enabling File Uploads (R2)

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Configure `src/lib/storage/r2.ts` with your Cloudflare R2 credentials.

### Enabling Email (Resend)

```bash
pnpm add resend
```

Configure `src/lib/email/resend.ts` with your Resend API key.

---

## 18. Architecture Reference

### Request Flow

```
Browser
  ↓  HTTP request
Next.js Server Component  ← fetches data directly, no client-side round trip
  ↓  mutation (form submit / button click)
Server Action              ← validates session, checks permissions, calls service
  ↓
Service Layer              ← business logic, state transitions, notifications, audit
  ↓
Repository Layer           ← Prisma queries, always filtered by organizationId
  ↓
PostgreSQL
```

**Rule:** Never call Prisma directly from a React component or Next.js page. Always go through the service → repository chain.

### Directory Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/            # Sign in
│   │   ├── org-picker/       # Organisation selection after login
│   │   ├── forgot-password/
│   │   └── invite/           # Accept org invitation
│   ├── (dashboard)/          # Authenticated app — all data pages
│   │   ├── layout.tsx        # Sidebar + Topbar + org guard
│   │   ├── dashboard/
│   │   ├── budgets/
│   │   │   ├── page.tsx      # Budget list with filters
│   │   │   ├── new/          # Budget creation form
│   │   │   └── [budgetId]/   # Budget detail + comments + approval flow
│   │   ├── approvals/
│   │   ├── accounts/
│   │   ├── income/
│   │   ├── expenditures/
│   │   ├── events/
│   │   ├── departments/
│   │   ├── analytics/
│   │   ├── audit/
│   │   ├── notifications/
│   │   ├── settings/
│   │   └── admin/
│   │       ├── users/        # Admin: all users + membership management
│   │       └── organisations/# Admin: all orgs overview
│   ├── splash/[orgId]/       # Branded org-loading transition screen
│   └── api/
│       ├── webhooks/         # M-Pesa + external callbacks
│       └── internal/revalidate/
│
├── components/
│   ├── ui/                   # Button, Card, Badge, Input, Progress, Skeleton
│   ├── shared/               # Sidebar, Topbar, DataTable, PageHeader, EmptyState
│   └── charts/               # CustomTooltip for Recharts v3
│
├── features/                 # Domain logic, co-located by feature
│   ├── budgets/
│   │   ├── actions/          # Server Actions (submitBudgetAction, reviewBudgetAction)
│   │   ├── services/         # Business logic (createBudget, submitBudget, reviewBudget)
│   │   ├── repositories/     # Prisma queries
│   │   ├── schemas/          # Zod validation
│   │   └── components/       # BudgetCard, BudgetStatusFlow
│   ├── income/               # actions · services · schemas
│   ├── analytics/            # Server-side aggregations with unstable_cache()
│   ├── audit/                # createAuditLog()
│   └── notifications/        # createNotification(), markRead()
│
├── lib/
│   ├── org/context.tsx       # OrgProvider + useOrg() hook
│   ├── prisma/client.ts      # PrismaClient singleton
│   ├── auth/
│   │   ├── auth.ts           # Auth.js v5 config (commented — configure to activate)
│   │   ├── session.ts        # requireSession() — injects org context into actions
│   │   └── permissions.ts    # hasPermission(), can()
│   ├── storage/r2.ts         # Cloudflare R2 (commented — configure to activate)
│   ├── email/resend.ts       # Transactional email templates (commented)
│   ├── mock/data.ts          # Dev data: 2 orgs, 6 users, cross-org memberships
│   └── utils.ts              # formatCurrency, formatDate, formatRelative, pct
│
├── types/index.ts             # Shared TypeScript types
└── proxy.ts                   # Route protection (Next.js 16 proxy/middleware)
```

---

## 19. Database Schema Reference

### Key Models

| Model | Purpose |
|-------|---------|
| `Organization` | Top-level tenant. All data belongs to one. |
| `User` | Global identity. One user, multiple org memberships. |
| `Membership` | Joins User ↔ Organization with role + department. |
| `Invite` | Time-limited invitation token for new members. |
| `Department` | Sub-unit of an org. Has a head and optional annual allocation. |
| `Event` | Planned activity. Links to budgets, income, and expenditure reports. |
| `EventTemplate` | Reusable template with default budget line items. |
| `Budget` | Spending plan with status lifecycle and line items. |
| `BudgetItem` | Single line in a budget (description, qty, unit cost, total). |
| `BudgetRevision` | JSON snapshot saved on every edit after NEEDS_CHANGES. |
| `BudgetCategory` | Configurable categories, hierarchical, per org. |
| `Approval` | Finance or Chairperson review record on a budget. |
| `ApprovalComment` | Threaded comment on an approval. |
| `FinancialAccount` | Bank, M-Pesa, cash, savings, or project account. |
| `AccountTransaction` | Ledger entry (credit/debit) with balance after. |
| `Income` | A recorded income event linked to an account. |
| `Disbursement` | Formal fund release from account to department. |
| `DisbursementItem` | Line items within a disbursement request. |
| `ExpenditureReport` | Post-event accountability report with status lifecycle. |
| `Receipt` | Uploaded receipt file metadata (file lives in R2). |
| `ReceiptAllocation` | Many-to-many join: Receipt ↔ BudgetItem with amount. |
| `Notification` | In-app notification per user. |
| `AuditLog` | Append-only record of every state-changing action. |
