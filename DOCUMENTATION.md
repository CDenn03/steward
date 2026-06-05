# Steward — Full System Documentation

> **Steward** is a financial governance platform built for faith-based organizations, non-profits, and community groups. It handles the complete lifecycle of organizational finance: planning budgets, routing them through approval workflows, releasing disbursements, recording income, and ensuring every expenditure is accounted for with receipts.

---

## Table of Contents

1. [What Steward Does](#1-what-steward-does)
2. [Who Uses It](#2-who-uses-it)
3. [Core Concepts](#3-core-concepts)
4. [The Budget Lifecycle](#4-the-budget-lifecycle)
5. [Financial Accounts & Transactions](#5-financial-accounts--transactions)
6. [Income Tracking](#6-income-tracking)
7. [Disbursements](#7-disbursements)
8. [Expenditure Reports & Receipts](#8-expenditure-reports--receipts)
9. [Events & Templates](#9-events--templates)
10. [Departments](#10-departments)
11. [Analytics & Reporting](#11-analytics--reporting)
12. [Notifications & Audit Trail](#12-notifications--audit-trail)
13. [Role & Permission Reference](#13-role--permission-reference)
14. [Multi-Organisation Support](#14-multi-organisation-support)
15. [Developer Setup](#15-developer-setup)
16. [Architecture Reference](#16-architecture-reference)

---

## 1. What Steward Does

Steward solves a specific problem that every committee-run organization faces: **how do you manage money transparently when multiple departments, a finance team, and leadership all need to see, approve, and be accountable for the same funds?**

The answer is a governed workflow:

```
Department plans spending  →  Budget is reviewed  →  Funds are released
       ↓                             ↓                       ↓
  Creates a budget           Finance checks it          Disbursement
  with line items            Chairperson approves       recorded in
  per category               or requests changes        the account
                                                              ↓
                                                    Department spends
                                                    money and uploads
                                                    receipts to prove it
                                                              ↓
                                                    Finance reconciles
                                                    receipts against
                                                    the approved budget
```

Every step is logged in an immutable audit trail, and the dashboard gives leadership a real-time picture of organizational finances.

---

## 2. Who Uses It

### Department Head
Runs a ministry or department (Youth, Outreach, Missions, etc.). Creates budget proposals for events and operations, submits them for approval, receives disbursements, and submits expenditure reports with receipts after spending.

### Finance Officer
Reviews all submitted budgets, approves or requests changes before they go to the chairperson. Manages bank and M-Pesa accounts, records income, approves disbursements, and reviews expenditure reports.

### Chairperson
Gives final approval on budgets that have passed finance review. Has visibility across all departments, events, and overall financial health. Can view all analytics.

### Admin
Has full access to everything. Manages users, departments, organization settings, and approval workflow configuration.

### Member
Limited role — can upload receipts to an existing expenditure report. Used for volunteers or team members who need to contribute supporting documents without having full financial access.

---

## 3. Core Concepts

### Organization
Everything in Steward is scoped to an **Organization**. Every user belongs to an organization through a **Membership**. All budgets, accounts, income, and audit logs belong to one organization and are never visible to another.

### Department
A sub-unit of the organization (e.g. Youth Ministry, Worship & Arts, Outreach). Departments have heads, can have annual budget allocations, and own their own budgets and expenditure reports.

### Event
A planned activity (e.g. Youth Annual Camp, Easter Conference). Events can be linked to budgets, income, and expenditure reports, making it easy to see the full financial picture of a single activity. Events can be created from **templates** so recurring activities (Annual Camp, Sunday School Supplies) don't need to be rebuilt every year.

### Budget
A formal proposal for spending money. Contains line items with descriptions, quantities, and unit costs. Goes through a two-stage approval process before any money can be spent or disbursed.

### Approval
A formal review record attached to a budget. Finance approves first; the chairperson approves second. Each approval stage can result in approval, rejection, or a request for changes. Comments can be attached to any approval.

### Financial Account
A real-world account where money lives — a bank account, M-Pesa till, cash float, or savings account. Steward tracks balances and all transactions across every account.

### Disbursement
A formal release of funds from an account to a department for an approved budget. Must be approved before money moves.

### Expenditure Report
The accountability document submitted after money is spent. Contains receipts and maps each receipt to one or more budget line items. Finance reviews and either approves or requests more documentation.

### Receipt
A scanned or photographed receipt uploaded to an expenditure report. One receipt can be allocated across multiple budget line items (e.g. a single catering invoice split between "Youth Meals" and "Leadership Meals"). One budget line item can have multiple receipts.

### Audit Log
Every action taken in the system — budget submitted, approval granted, income recorded, receipt uploaded — is written to an append-only audit log with the actor, timestamp, and before/after state. Cannot be edited or deleted.

---

## 4. The Budget Lifecycle

This is the central workflow in Steward. Understanding it is essential.

### States

```
DRAFT → SUBMITTED → FINANCE_APPROVED → CHAIR_APPROVED
                         ↓
                   NEEDS_CHANGES ← ── (either review stage)
                         ↓
                    (back to DRAFT for editing)
                         
     Any stage → REJECTED (terminal)
```

| Status | Meaning |
|--------|---------|
| `DRAFT` | Being written by the department head. Not yet visible to finance. |
| `SUBMITTED` | Sent for review. Finance can now see and act on it. |
| `NEEDS_CHANGES` | Reviewer requested revisions. Returns control to the department head. |
| `FINANCE_APPROVED` | Finance has approved. Now queued for chairperson. |
| `CHAIR_APPROVED` | Fully approved. Disbursements can now be requested against this budget. |
| `REJECTED` | Permanently rejected at either review stage. A new budget must be created. |

### Step-by-Step

**1. Department Head creates a budget (DRAFT)**

The department head opens *Budgets → New Budget* and fills in:
- Title (e.g. "Youth Annual Camp 2025")
- Department and optional event link
- Period start and end dates
- Line items: description, category, quantity, unit cost

The form calculates totals live. The budget is saved as a DRAFT and only visible to the creator and admins.

**2. Department Head submits (SUBMITTED)**

Once satisfied, the department head clicks "Submit for Review". The status moves to `SUBMITTED`. Finance officers receive a notification. The department head can no longer edit the budget (unless it comes back as `NEEDS_CHANGES`).

**3. Finance reviews (FINANCE_APPROVED or NEEDS_CHANGES)**

The finance officer opens the budget from their Approvals queue. They can:
- Read all line items and supporting attachments
- Add comments asking for clarification
- **Approve** → moves to `FINANCE_APPROVED`, queues for chairperson
- **Request Changes** → moves to `NEEDS_CHANGES`, returns to department head
- **Reject** → moves to `REJECTED`, terminal

**4. Department Head revises (if needed)**

If changes were requested, the department head sees the budget back in their drafts with the reviewer's comment. They edit and re-submit, restarting the finance review step.

**5. Chairperson gives final approval (CHAIR_APPROVED)**

The chairperson sees finance-approved budgets in their Approvals queue. They can:
- **Approve** → moves to `CHAIR_APPROVED`. The budget is now active.
- **Request Changes** → moves back to `NEEDS_CHANGES`
- **Reject** → `REJECTED`

**6. Disbursement is requested**

With the budget approved, the department head (or finance) can request a disbursement: a formal request to release a specific amount from a specific account for this budget.

**7. Finance approves and releases the disbursement**

Finance reviews the disbursement request and releases the funds. The account balance is updated and a transaction is recorded.

**8. Department spends the money**

The department runs the event or activity and collects receipts.

**9. Expenditure Report is submitted**

The department head creates an expenditure report linked to the budget. They upload receipts and allocate each receipt to the relevant budget line item(s). The report is submitted to finance.

**10. Finance reconciles and closes**

Finance reviews each receipt against the budget. If everything checks out, the report is approved and the budget is considered fully accounted for. If receipts are missing or amounts don't match, Finance can request more information.

---

## 5. Financial Accounts

Steward tracks multiple financial accounts per organization.

### Account Types

| Type | Example |
|------|---------|
| `BANK` | KCB Bank — Main Operating Account |
| `MPESA` | Safaricom M-Pesa Till |
| `CASH` | Petty cash float |
| `SAVINGS` | Equity Bank — Youth Fund |
| `PROJECT` | Dedicated project account |

### Account Dashboard

The Accounts page shows:
- Current balance per account
- This month's inflows and outflows
- Full transaction history with filtering
- Total liquid assets across all accounts

### Account Transactions

Every credit (income, transfers in) and debit (disbursement, expense) creates an `AccountTransaction` record with the balance after the transaction. This gives a complete, auditable ledger for each account.

---

## 6. Income Tracking

The Finance Officer records all income received by the organization.

### Income Categories

| Category | Example |
|----------|---------|
| `TITHE` | Monthly tithes |
| `OFFERING` | Sunday offering |
| `DONATION` | One-off donor gift |
| `REGISTRATION` | Event registration fees |
| `FUNDRAISING` | Fundraiser proceeds |
| `GRANT` | External grant or funding |
| `OTHER` | Miscellaneous income |

### Recording Income

Finance opens *Income → Record Income* and enters:
- The account the money was received into
- Category and amount
- Description and date received
- Optional: link to a department or event

The account balance is updated immediately and a credit transaction is created.

### Income Analytics

The Analytics page shows monthly income trends broken down by category, so leadership can see seasonal patterns (e.g. higher offerings during Easter, lower during school holidays).

---

## 7. Disbursements

A disbursement is a formal, auditable release of money from an account to a department for an approved budget.

### Disbursement Flow

```
Department Head requests disbursement
        ↓
Finance reviews the request
        ↓
Finance approves → account balance decreases → debit transaction created
        ↓
Department receives funds and can begin spending
```

### Disbursement States

| Status | Meaning |
|--------|---------|
| `PENDING` | Submitted, awaiting finance review |
| `APPROVED` | Finance has approved but funds not yet released |
| `RELEASED` | Funds transferred, account balance updated |
| `CANCELLED` | Withdrawn before release |

### Partial Disbursements

A department does not have to disburse the full budget at once. Multiple disbursements can be made against a single budget as spending phases progress (e.g. first disbursement for transport, second for accommodation).

---

## 8. Expenditure Reports & Receipts

This is the accountability layer — the proof that approved budget funds were spent correctly.

### Many-to-Many Receipt Allocation

Steward supports a flexible receipt allocation model:

```
One receipt → many budget items
  (e.g. a single catering invoice split across "Meals Day 1" and "Meals Day 2")

One budget item → many receipts
  (e.g. "Transport" covered by multiple taxi receipts)
```

This mirrors real-world spending patterns and prevents the common problem of "this receipt doesn't fit one line item exactly."

### Submitting an Expenditure Report

1. Department head opens *Expenditures → New Report*
2. Links the report to the budget
3. Uploads receipts (PDF, JPEG, PNG) — stored in Cloudflare R2
4. For each receipt: sets amount, vendor, date, and allocates to budget line item(s)
5. Submits the report to finance

### Finance Review

Finance opens the report and can:
- View each receipt (linked from R2)
- See the allocation mapping
- Approve the report
- Request more receipts or documentation
- Reject the report

### Outstanding Accountability

The dashboard shows "Outstanding Reports" — budgets that have been fully disbursed but don't yet have an approved expenditure report. This is a key governance indicator. A high outstanding count means departments are not yet submitting their receipts.

---

## 9. Events & Templates

### Events

Events are planned activities with dates and a status:

| Status | Meaning |
|--------|---------|
| `PLANNING` | Being planned, budget may not be approved yet |
| `ACTIVE` | Currently in progress |
| `COMPLETED` | Finished |
| `CANCELLED` | Called off |

Events can be linked to budgets, income records, and expenditure reports, giving a complete financial picture per event.

### Templates

Recurring events (Annual Youth Camp, Sunday School Supplies, Easter Conference) can be saved as **Event Templates** with default budget line items and categories.

When creating a new event from a template, all the standard line items are pre-populated. The department head adjusts quantities and costs for the current year, saving significant time.

### Example Template: Youth Annual Camp

```
Template: Youth Annual Camp
─────────────────────────────────────────────────
Transport          │ Bus hire × 2           │ per bus
Accommodation      │ Camp site × participants│ per person/night
Catering           │ Full board × participants│ per person
Speaker Fees       │ Guest speaker × 1      │ per speaker
Equipment          │ Sound system rental    │ lump sum
Printing           │ T-shirts & materials   │ per participant
Contingency        │ 10% of total           │ lump sum
```

Each year, the department head creates "Youth Annual Camp 2026" from this template, updates the participant count and current prices, and submits — instead of rebuilding from scratch.

---

## 10. Departments

### Department Structure

Each department has:
- A name and optional description
- A designated department head (a user with the `DEPARTMENT_HEAD` role)
- An optional annual budget allocation (soft limit — warns but doesn't block)

### Department Budget Allocations

The admin can set an annual allocation per department (e.g. Youth: KES 600,000 for FY2026). This is stored in `DepartmentAllocation` and is used in analytics to show allocation vs. actual spend.

It is a **soft limit** — the system will show a warning when a budget would exceed the department's allocation, but it does not prevent submission. The finance officer decides whether to approve an over-allocation.

### Department Analytics

The Analytics page shows per-department:
- Total allocated
- Total approved budget
- Total spent
- Variance (how much is left)
- Utilisation percentage

---

## 11. Analytics & Reporting

All analytics are computed **server-side** using Prisma queries and cached with Next.js `unstable_cache()`. They are never calculated in React components. This keeps the interface fast and the data consistent.

### Dashboard Widgets

**Finance Officer view:**
- Pending Reviews — budgets waiting for finance review
- Pending Disbursements — disbursement requests awaiting approval
- Pending Accountability — submitted expenditure reports awaiting review
- Account Balances — current balance across all accounts

**Chairperson view:**
- Organization Income — total income year to date
- Organization Expenses — total expenditure year to date
- Outstanding Accountability — departments with unsubmitted expenditure reports
- Upcoming Events — events with approved budgets
- Department Utilisation — how much each department has spent relative to allocation
- Budget Variance — approved vs. actual across all budgets

**Department Head view:**
- Draft Budgets — their own budgets in progress
- Pending Approvals — their submitted budgets awaiting review
- Approved Budgets — their active budgets
- Outstanding Reports — their expenditure reports not yet submitted

### Analytics Pages

| Metric | Description |
|--------|-------------|
| Department Budget vs Spend | Bar chart comparing allocated vs. spent per department |
| Income Trend | Month-by-month income broken down by category |
| Budget Allocation by Dept | Pie chart of total budget allocation |
| Budget Variance Report | Table: allocated, spent, variance, utilisation per budget |

### Export

Budgets, income records, expenditure reports, and audit logs can be exported. Format options are planned for CSV and PDF.

---

## 12. Notifications & Audit Trail

### Notifications

Steward sends in-app notifications (and optionally email via Resend) for key events:

| Trigger | Recipients |
|---------|------------|
| Budget submitted for review | All Finance Officers |
| Budget approved by finance | Department Head, Chairperson |
| Budget needs changes | Department Head |
| Budget finally approved | Department Head |
| Budget rejected | Department Head |
| Disbursement requested | Finance Officers |
| Disbursement released | Department Head |
| Expenditure report submitted | Finance Officers |
| Expenditure report approved | Department Head |
| Outstanding report reminder | Department Head (weekly) |

### Audit Log

Every state-changing action creates an immutable `AuditLog` record containing:

| Field | Description |
|-------|-------------|
| `actorId` | Who performed the action |
| `entityType` | What kind of record was affected (Budget, Income, Receipt…) |
| `entityId` | The specific record ID |
| `action` | What happened (submitted, approved, uploaded, recorded…) |
| `before` | JSON snapshot of state before the change |
| `after` | JSON snapshot of state after the change |
| `createdAt` | Exact timestamp |

The Audit Log page shows this trail with filtering by entity type, actor, and date range. It cannot be edited or deleted — it is append-only by design.

---

## 13. Role & Permission Reference

Steward uses a **permission-based** model. Roles are groupings of permissions. This means a user can have exactly the access they need — no more, no less.

### Permissions

| Permission | Description |
|------------|-------------|
| `budget.create` | Create a new budget |
| `budget.edit_own` | Edit your own draft budget |
| `budget.submit` | Submit a draft budget for review |
| `budget.review` | View budgets in the review queue |
| `budget.approve_finance` | Approve at the finance stage |
| `budget.approve_chair` | Give final chairperson approval |
| `expenditure.create` | Create an expenditure report |
| `expenditure.review` | Review submitted expenditure reports |
| `receipt.upload` | Upload receipts to an expenditure report |
| `income.record` | Record income transactions |
| `account.manage` | Manage financial accounts and balances |
| `disbursement.create` | Request a disbursement |
| `disbursement.approve` | Approve and release a disbursement |
| `analytics.view` | Access the Analytics page |
| `organization.manage` | Edit organization settings |
| `users.manage` | Invite and manage users |

### Role → Permission Mapping

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

---

## 14. Multi-Organisation Support

Steward is built as a multi-tenant SaaS platform from day one, even if only one organization uses it initially.

### Isolation Guarantee

Every database query includes `organizationId` as a required filter. It is impossible for data from one organization to appear in another organization's context. The `requireSession()` function always injects the current user's `organizationId` into every service call.

### Organization Switching

A user can be a member of multiple organizations (e.g. a consultant who manages finances for several churches). Switching organizations is done through the organization selector in the sidebar.

### Inviting Users

The admin or chairperson sends an invitation by email. The invite contains a unique token with an expiry. The recipient clicks the link, creates their account (or signs in), and joins the organization with the pre-assigned role.

---

## 15. Developer Setup

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 — `npm install -g pnpm`
- **PostgreSQL** database (local, [Neon](https://neon.tech), [Supabase](https://supabase.com))

### Install

```bash
pnpm install
# postinstall automatically runs `prisma generate`
```

### Environment

```bash
cp .env.example .env.local
```

Minimum required variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/steward"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### Database

```bash
# Apply the schema
pnpm db:migrate

# Seed with Grace Community Church sample data
pnpm db:seed

# Or do both in one:
pnpm db:setup
```

### Dev server

```bash
pnpm dev
# → http://localhost:3000
```

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check only |
| `pnpm db:generate` | Regenerate Prisma client after schema changes |
| `pnpm db:migrate` | Run pending migrations (dev) |
| `pnpm db:migrate:prod` | Run pending migrations (production, safe) |
| `pnpm db:seed` | Seed sample data |
| `pnpm db:setup` | generate + migrate + seed |
| `pnpm db:studio` | Prisma Studio (visual DB browser) |
| `pnpm db:reset` | ⚠️ Reset database (drops all data) |

### Adding Auth.js

```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

Uncomment the code in `src/lib/auth/auth.ts` and configure providers.

### Adding File Uploads (Cloudflare R2)

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Follow the setup comments in `src/lib/storage/r2.ts`.

### Adding Email (Resend)

```bash
pnpm add resend
```

Follow the setup comments in `src/lib/email/resend.ts`.

---

## 16. Architecture Reference

### Request Flow

```
Browser request
    ↓
Next.js Server Component   ← reads data directly, no client round-trip
    ↓ (mutation)
Server Action              ← validates session, calls service
    ↓
Service Layer              ← business logic, status transitions, notifications
    ↓
Repository Layer           ← Prisma queries (always scoped to organizationId)
    ↓
PostgreSQL (Neon)
```

Never call Prisma directly from a React component or page.

### Directory Map

```
src/
├── app/
│   ├── (auth)/                  # Unauthenticated pages
│   │   ├── login/
│   │   ├── forgot-password/
│   │   └── invite/
│   └── (dashboard)/             # Authenticated app shell
│       ├── layout.tsx           # Sidebar + Topbar wrapper
│       ├── dashboard/
│       ├── budgets/
│       │   ├── page.tsx         # Budget list
│       │   ├── new/             # Budget creation form
│       │   └── [budgetId]/      # Budget detail + edit
│       ├── approvals/
│       ├── accounts/
│       ├── income/
│       ├── expenditures/
│       ├── events/
│       ├── departments/
│       ├── analytics/
│       ├── audit/
│       ├── notifications/
│       └── settings/
│
├── components/
│   ├── ui/                      # Primitives: Button, Card, Badge, Input…
│   ├── shared/                  # App-level: Sidebar, Topbar, DataTable…
│   └── charts/                  # Recharts wrappers: CustomTooltip…
│
├── features/                    # Domain logic, co-located by feature
│   ├── budgets/
│   │   ├── actions/index.ts     # Server Actions (called from UI)
│   │   ├── services/index.ts    # Business logic
│   │   ├── repositories/index.ts# Prisma queries
│   │   ├── schemas/index.ts     # Zod validation schemas
│   │   └── components/          # Feature-specific UI components
│   ├── approvals/
│   ├── income/
│   ├── analytics/               # Server-side aggregations + caching
│   ├── audit/
│   └── notifications/
│
├── lib/
│   ├── prisma/client.ts         # PrismaClient singleton
│   ├── auth/
│   │   ├── auth.ts              # Auth.js v5 config
│   │   ├── session.ts           # requireSession() helper
│   │   └── permissions.ts       # hasPermission(), can()
│   ├── storage/r2.ts            # Cloudflare R2 client
│   ├── email/resend.ts          # Transactional email
│   ├── mock/data.ts             # Dev data (replace with DB queries)
│   └── utils.ts                 # formatCurrency, formatDate…
│
├── types/index.ts               # Shared TypeScript types
└── proxy.ts                     # Route protection (Next.js 16)
```

### Technology Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Framework | Next.js 16 (App Router) | Server Components, Server Actions, streaming |
| Language | TypeScript | Type safety across the full stack |
| Styling | Tailwind CSS v4 | Utility-first, no runtime overhead |
| Database | PostgreSQL (Neon) | Reliable, serverless-friendly |
| ORM | Prisma 6 | Type-safe queries, migrations, studio |
| Auth | Auth.js v5 | Email, magic links, Google OAuth |
| Storage | Cloudflare R2 | S3-compatible, no egress fees |
| Email | Resend | Transactional email, great deliverability |
| Charts | Recharts v3 | Composable, React-native charts |
| Package manager | pnpm | Fast, strict, workspace-aware |

### Key Design Decisions

**Server Components by default.** Pages fetch their own data using Prisma on the server. There are no client-side data fetching libraries (no SWR, no React Query). Mutations go through Server Actions.

**Feature-based, not layer-based.** Everything for budgets lives in `src/features/budgets/`. Not split across `src/services/`, `src/repositories/`, `src/actions/`. This makes features easy to find and delete without hunting across the codebase.

**Analytics never in React.** All aggregations (department spend, budget variance, income totals) are computed in `src/features/analytics/services/` using Prisma, cached server-side with `unstable_cache()`, and passed as plain data to components. Components just render numbers.

**Permissions, not just roles.** The permissions layer in `src/lib/auth/permissions.ts` means access control is explicit and auditable. Adding a new permission doesn't require changing role definitions everywhere — you add it to the relevant roles in one place.

**Immutable audit log.** The `AuditLog` table is append-only. No update or delete operations are ever run on it. It records the `before` and `after` JSON state for every meaningful change, giving a complete reconstruction of any record's history.

