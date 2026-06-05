# Steward — Incomplete Items & Product Gaps
### Version 3 · June 2025

> This document is an honest audit of what has been built, what is scaffolded but not functional, and what is entirely missing compared to what the full product requires. Items are grouped by priority and labelled with effort estimates.

---

## How to Read This Document

| Label | Meaning |
|-------|---------|
| 🔴 **Blocker** | Required before the product can be used by a real organisation |
| 🟠 **High** | Significant feature gap — heavily degrades the experience without it |
| 🟡 **Medium** | Real limitation but the product is usable without it |
| 🟢 **Nice to have** | Polish, optimisation, or convenience feature |
| `UI` | Frontend work only |
| `BE` | Backend / server logic only |
| `UI+BE` | Requires both |
| `Infra` | Infrastructure, config, or third-party integration |

---

## SECTION 1 — Authentication & Session (🔴 Blockers)

### 1.1 Auth.js is not wired up
**Status:** Code exists in `src/lib/auth/auth.ts` but is entirely commented out.
**Impact:** There is no real login. The login page navigates to `/org-picker` regardless of what is entered. Any URL is accessible without credentials.
**What needs to happen:**
- Install `next-auth@beta @auth/prisma-adapter`
- Configure at least one provider (email/password via Credentials, or magic link via Resend)
- Connect the Prisma adapter to the database
- Uncomment `auth.ts`, `session.ts`
- Update `requireSession()` to call the real `auth()` function and redirect if unauthenticated
**Effort:** `Infra + BE` · 1–2 days

### 1.2 Route protection is not enforced
**Status:** `src/proxy.ts` exists but the session check is commented out.
**Impact:** All dashboard routes (`/dashboard`, `/budgets`, etc.) are publicly accessible without login.
**What needs to happen:**
- After Auth.js is configured, uncomment the session check in `proxy.ts`
- Ensure redirect to `/login?callbackUrl=...` on unauthenticated access
**Effort:** `BE` · 2 hours (depends on 1.1)

### 1.3 Session carries no real org context
**Status:** `requireSession()` returns hardcoded mock values (`userId: "user-1"`, `organizationId: "org-1"`).
**Impact:** All Server Actions (create budget, record income, etc.) are stubbed against fake data. Nothing actually writes to the database via a real user's identity.
**What needs to happen:**
- `requireSession()` must read the real Auth.js session
- Add `organizationId` and `role` to the JWT payload (via `callbacks.jwt`)
- Validate the membership exists in the database on every request
**Effort:** `BE` · 4 hours (depends on 1.1)

### 1.4 Password reset not functional
**Status:** The forgot-password page UI exists and simulates a "sent" state, but no email is actually sent and no token is generated or stored.
**What needs to happen:**
- Auth.js email provider handles this automatically if configured
- Alternatively: generate a `VerificationToken`, store in DB, send via Resend
**Effort:** `BE + Infra` · 4 hours (depends on 1.1)

### 1.5 Invitation system not functional
**Status:** The invite acceptance UI (`/invite`) exists but the invite modal in Admin → Users only simulates sending.
**What needs to happen:**
- `Invite` table already exists in schema — needs a create action
- Generate a unique token, set expiry, store in DB, send email via Resend
- Acceptance page reads token from query string, validates against DB, creates `Membership`
- Handle "user already exists" vs "new user" paths
**Effort:** `UI+BE+Infra` · 1 day

---

## SECTION 2 — Data Layer (🔴 Blockers)

### 2.1 All pages use mock data, not the database
**Status:** Every dashboard page imports from `src/lib/mock/data.ts`. No page fetches real data from PostgreSQL.
**Impact:** The entire product is a prototype. No data persists between sessions.
**What needs to happen:** Every page needs to be rewritten to fetch from the database via repository functions. The repository layer (`src/features/*/repositories/`) is scaffolded — it needs to be called from pages and Server Actions rather than mock data.
**Priority pages to migrate first:**
1. Dashboard stats
2. Budgets list + detail
3. Approvals queue
4. Accounts + balances
5. Income list
6. Expenditure reports
**Effort:** `BE` · 3–5 days total

### 2.2 Server Actions do not persist to the database
**Status:** `createBudgetAction`, `submitBudgetAction`, `reviewBudgetAction`, `recordIncomeAction` all call services that call Prisma — but Prisma is not connected (no real `DATABASE_URL`).
**Impact:** The form on `/budgets/new` appears to work but saves nothing.
**What needs to happen:** Connect a real PostgreSQL database, run migrations, and the service layer should work as-is once session context is real (item 1.3).
**Effort:** `Infra` · 2 hours (plus items 1.1 and 1.3)

### 2.3 Budget detail page uses hardcoded line items
**Status:** `/budgets/[budgetId]/page.tsx` shows static hardcoded mock items regardless of which budget ID is in the URL.
**What needs to happen:** Fetch `Budget` with `items`, `approvals`, `expenditures`, and `attachments` from the database using the repository layer.
**Effort:** `BE + UI` · 4 hours

---

## SECTION 3 — Expenditure Reports & Receipts (🔴 Blockers)

### 3.1 Receipt upload does not work
**Status:** The expenditure report page UI exists and shows a "Upload Receipts" button, but there is no actual file upload flow. Cloudflare R2 is configured in comments only.
**What needs to happen:**
- Install `@aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
- Configure R2 credentials in `.env.local`
- Uncomment `src/lib/storage/r2.ts`
- Create a Server Action that generates a signed upload URL
- Add a file input component that uploads directly to R2 from the browser
- Save the `storageKey`, `fileName`, `mimeType`, `size` to the `Receipt` table
**Effort:** `UI+BE+Infra` · 1–2 days

### 3.2 Receipt allocation UI does not exist
**Status:** No UI exists for the many-to-many allocation of receipts to budget line items.
**Impact:** Expenditure reports cannot be completed without this.
**What needs to happen:**
- After uploading a receipt, show a list of the linked budget's line items
- Allow the user to enter an amount to allocate from this receipt to each item
- Validate that total allocated = receipt amount
- Save `ReceiptAllocation` records
**Effort:** `UI+BE` · 2 days

### 3.3 Expenditure report creation form is a stub
**Status:** `/expenditures/page.tsx` shows a table of mock reports but there is no form to create a new report.
**What needs to happen:**
- Build a multi-step form: select budget → upload receipts → allocate → submit
- Wire to `ExpenditureReport` create and update Server Actions
**Effort:** `UI+BE` · 2 days

---

## SECTION 4 — Budget Workflow (🟠 High Priority)

### 4.1 Budget creation form does not save to DB
**Status:** The form at `/budgets/new` is fully built with live line-item calculation and validation. The submit action calls the service but nothing persists (item 2.2).
**What needs to happen:** Resolve items 1.1, 1.3, and 2.2 first — the service layer will then work.
**Effort:** 0 additional hours once blockers are resolved.

### 4.2 Budget detail: approve/reject buttons are not wired
**Status:** The buttons exist on `/budgets/[budgetId]/page.tsx` and look correct, but they call no Server Action.
**What needs to happen:**
- Add `onClick` handlers calling `reviewBudgetAction()`
- Show a confirmation dialog with an optional comment field before approving or rejecting
- Refresh the page data after action completes
**Effort:** `UI+BE` · 4 hours

### 4.3 Budget comments are hardcoded
**Status:** The comments section on the budget detail page shows two hardcoded mock comments. The "Post Comment" button does nothing.
**What needs to happen:**
- Create `addApprovalCommentAction` Server Action
- Fetch real comments from `ApprovalComment` table
- Optimistic update on post
**Effort:** `UI+BE` · 4 hours

### 4.4 Budget attachments cannot be uploaded
**Status:** The attachments panel shows two hardcoded file names. No upload mechanism exists.
**What needs to happen:** Same R2 setup as item 3.1. Create an `Attachment` record after upload.
**Effort:** `UI+BE` · 4 hours (shares work with 3.1)

### 4.5 Budget revision history is not shown
**Status:** `BudgetRevision` records are written in the service but never displayed in the UI.
**What needs to happen:** Add a "Revision History" tab to the budget detail page showing the changelog with diffs.
**Effort:** `UI+BE` · 1 day

### 4.6 Budget edit page is a stub
**Status:** `/budgets/[budgetId]/edit/page.tsx` just shows the budget title and a note. No actual edit form.
**What needs to happen:** Reuse the new-budget form but pre-populate it with existing data and save as an update rather than create.
**Effort:** `UI+BE` · 4 hours

---

## SECTION 5 — Disbursements (🟠 High Priority)

### 5.1 Disbursement request form does not exist
**Status:** There is no UI to request a disbursement. The "Request Disbursement" button on the budget detail page does nothing.
**What needs to happen:**
- Build a modal or inline form: select account, enter amount, add description + line-item breakdown
- Wire to a `createDisbursementAction`
**Effort:** `UI+BE` · 1 day

### 5.2 Disbursement approval flow is not built
**Status:** Disbursements appear in the approvals page as static mock items. There is no real queue, no approve/release button wiring.
**What needs to happen:**
- Fetch pending disbursements from DB in the Approvals page
- Wire "Release Funds" button to a `releaseDisbursementAction`
- Deduct from account balance and create `AccountTransaction`
**Effort:** `UI+BE` · 1 day

---

## SECTION 6 — Income (🟠 High Priority)

### 6.1 Record Income modal/form does not exist
**Status:** The "Record Income" button on `/income` is present but does nothing. There is no form.
**What needs to happen:**
- Build a modal form: select account, choose category, enter amount, description, date, optional department/event link
- Wire to `recordIncomeAction`
- Refresh account balance display after recording
**Effort:** `UI+BE` · 4 hours

### 6.2 Income list shows mock records only
**Status:** The income table on `/income` shows hardcoded mock records.
**What needs to happen:** Fetch from `Income` table with account + department + event joins.
**Effort:** `BE` · 2 hours

---

## SECTION 7 — Accounts (🟠 High Priority)

### 7.1 Add Account form does not exist
**Status:** The "Add Account" button exists but does nothing.
**What needs to happen:** Build a modal form for creating a `FinancialAccount` with name, type, provider, account number, opening balance.
**Effort:** `UI+BE` · 3 hours

### 7.2 Transaction history is mock data
**Status:** The accounts page shows 6 hardcoded transactions.
**What needs to happen:** Fetch `AccountTransaction` records from DB with filtering by account.
**Effort:** `BE` · 2 hours

### 7.3 Account balances are not live
**Status:** Balances shown in the sidebar and accounts page come from mock data and do not reflect real transactions.
**What needs to happen:** Fetch live from `FinancialAccount.balance` after DB connection is established.
**Effort:** `BE` · 1 hour (depends on item 2.1)

---

## SECTION 8 — Events & Departments (🟡 Medium Priority)

### 8.1 Events page is a stub
**Status:** Events are displayed as cards from mock data. There is no form to create an event.
**What needs to happen:**
- Build event creation form (name, department, dates, status)
- Wire to a `createEventAction`
- Fetch real events from DB
**Effort:** `UI+BE` · 1 day

### 8.2 Event Templates not implemented
**Status:** The `EventTemplate` and `BudgetItemTemplate` models exist in the schema. No UI or logic exists.
**What needs to happen:**
- Build a template management page
- Allow "Create from template" when creating a new budget
- Pre-populate line items from the template, allowing overrides
**Effort:** `UI+BE` · 2 days

### 8.3 Departments page is a stub
**Status:** Departments show as cards from mock data. No create/edit form.
**What needs to happen:**
- Build department creation form
- Build department head assignment UI
- Build annual allocation entry per fiscal year
- Wire to department CRUD actions
**Effort:** `UI+BE` · 1 day

### 8.4 Department utilisation warnings not shown
**Status:** The soft-limit allocation check exists in the documentation but is not implemented in the budget creation form.
**What needs to happen:** When a user adds line items, compare running total against remaining department allocation and show a yellow warning if it would be exceeded.
**Effort:** `UI+BE` · 4 hours

---

## SECTION 9 — Analytics (🟡 Medium Priority)

### 9.1 Analytics use mock data
**Status:** The analytics page shows charts powered by `mockIncomeMonthly` and `mockBudgets`. The `features/analytics/services/` queries are written but not called.
**What needs to happen:** Replace mock data imports with calls to the analytics service functions (`getDepartmentSpend`, `getIncomeByMonth`, `getBudgetVariance`).
**Effort:** `BE` · 4 hours (depends on item 2.1)

### 9.2 Dashboard stats are hardcoded per org
**Status:** `mockDashboardStats` has two hardcoded stat objects keyed by org ID.
**What needs to happen:** Call `getDashboardStats(organizationId)` from the analytics service.
**Effort:** `BE` · 2 hours

### 9.3 Date range filtering not built
**Status:** The analytics page has no date range picker. It always shows all-time data.
**What needs to happen:** Add a fiscal year / custom date range selector. Pass date range to service functions.
**Effort:** `UI+BE` · 1 day

### 9.4 Export to CSV/PDF not implemented
**Status:** The "Export" button exists on the dashboard and budgets page but does nothing.
**What needs to happen:**
- Budget export: generate a CSV or PDF of the budget with all line items
- Income export: date-range filtered CSV of income records
- Expenditure export: report with receipt list
- Consider a server-side PDF generation library (`@react-pdf/renderer` or Puppeteer)
**Effort:** `BE` · 2–3 days

---

## SECTION 10 — Notifications & Audit (🟡 Medium Priority)

### 10.1 Email notifications are not sent
**Status:** `src/lib/email/resend.ts` has email templates written but all are commented out. No emails are sent anywhere.
**What needs to happen:**
- Install `resend`
- Configure `RESEND_API_KEY` in `.env.local`
- Uncomment the Resend client
- Call the email functions from service layer (e.g. in `submitBudgetService`, after the DB write)
**Effort:** `BE+Infra` · 4 hours

### 10.2 Audit log shows mock data
**Status:** The audit log page fetches from `mockAuditLogs`.
**What needs to happen:** Fetch from `AuditLog` table with actor join, filtering, and pagination.
**Effort:** `BE` · 2 hours

### 10.3 Audit log has no search or filtering
**Status:** The table shows all entries with no way to filter by actor, entity type, date, or action.
**What needs to happen:** Add filter dropdowns and a date range picker above the table.
**Effort:** `UI` · 4 hours

### 10.4 Notifications page shows mock data
**Status:** Notifications come from `mockNotifications`.
**What needs to happen:** Fetch from `Notification` table scoped to `userId + organizationId`. Mark as read on click.
**Effort:** `BE` · 2 hours

### 10.5 Real-time notification count not implemented
**Status:** The notification bell in the topbar always shows a static red dot. The count does not reflect real unread notifications.
**What needs to happen:** Poll `getUnreadCount()` every 30 seconds, or use a server-sent event / WebSocket for real-time push.
**Effort:** `UI+BE` · 4–8 hours

---

## SECTION 11 — Admin Panel (🟡 Medium Priority)

### 11.1 Admin user management is read-only
**Status:** The user list expands to show memberships, but Edit and Remove buttons do nothing.
**What needs to happen:**
- Wire "Edit membership" to an update action (change role or department)
- Wire "Remove from org" to a delete membership action
- Build an "Edit" inline form that appears within the expanded row
**Effort:** `UI+BE` · 1 day

### 11.2 New Organisation form does not save
**Status:** The "New Organisation" modal has inputs but no submit action.
**What needs to happen:** Create `createOrganizationAction`, validate slug uniqueness, save to DB.
**Effort:** `BE` · 3 hours

### 11.3 Organisation settings page does not exist
**Status:** Each org card in `/admin/organisations` has a settings icon that goes nowhere.
**What needs to happen:** Build a dedicated org settings page with name, slug, currency, fiscal year, logo upload, and approval workflow configuration.
**Effort:** `UI+BE` · 1 day

### 11.4 Cross-org notification deep-links not implemented
**Status:** When Daniel receives a notification about a Grace Community Church budget while working in Hope Foundation, clicking the link should trigger the org switch + splash screen, then open the budget. Currently it would just navigate to `/budgets/[id]` in the wrong org.
**What needs to happen:** Notification links need to encode the org ID. A route handler checks if the org in the link matches the active session org; if not, it triggers the switch flow.
**Effort:** `UI+BE` · 4 hours

---

## SECTION 12 — Organisation Switching (🟡 Medium Priority)

### 12.1 Org context is lost on hard refresh
**Status:** `sessionStorage` is used to persist the active org. If the user opens a new tab or closes and reopens the browser, they are redirected to the org picker again.
**What needs to happen:** For better UX, persist the last selected org in a cookie (or in the JWT) so it survives refreshes and new tabs. The user still sees the org picker after a new login session.
**Effort:** `BE` · 3 hours

### 12.2 No "remember this org" preference
**Status:** Users with one organisation always see the org picker, which is unnecessary friction.
**What needs to happen:** If the user has exactly one membership, skip the picker and go straight to the splash screen. If they have multiple, show the picker but allow a "always start here" default preference.
**Effort:** `UI+BE` · 3 hours

---

## SECTION 13 — Settings (🟡 Medium Priority)

### 13.1 Settings form does not save
**Status:** The settings page has inputs pre-filled from the org context but the "Save Changes" button does nothing.
**What needs to happen:** Wire to `updateOrganizationAction` and `updateUserProfileAction` Server Actions.
**Effort:** `BE` · 3 hours

### 13.2 Profile photo upload not built
**Status:** The profile/avatar section shows initials only. There is no way to upload a photo.
**What needs to happen:** Add a file input to the profile section, upload to R2, save URL to `User.avatarUrl`.
**Effort:** `UI+BE` · 4 hours (shares R2 work with item 3.1)

### 13.3 Org logo upload not built
**Status:** Organisations use text initials as their logo. No image upload exists.
**What needs to happen:** Add logo upload to org settings, store in R2, display in org picker and sidebar.
**Effort:** `UI+BE` · 4 hours

### 13.4 Notification preferences do not save
**Status:** The toggle switches on the settings page look interactive but call no action.
**What needs to happen:** Create a `NotificationPreference` model (or JSON column on `Membership`) and a `updateNotificationPreferencesAction`.
**Effort:** `UI+BE` · 4 hours

---

## SECTION 14 — Security & Production Hardening (🟠 High Priority for Go-Live)

### 14.1 CSRF protection
**Status:** Next.js Server Actions have built-in CSRF protection for same-origin requests. But explicit validation of the `Origin` header should be added for extra safety.
**Effort:** `BE` · 2 hours

### 14.2 Rate limiting on auth endpoints
**Status:** No rate limiting exists on login, magic link, or invite endpoints.
**What needs to happen:** Add rate limiting to `/api/auth/*` using an edge middleware library (`@upstash/ratelimit` + Redis).
**Effort:** `Infra` · 4 hours

### 14.3 Input sanitisation
**Status:** Zod validation exists in schemas for budget and income creation. Most other mutations (comments, org creation, etc.) have no validation.
**What needs to happen:** Add Zod schemas to all Server Actions.
**Effort:** `BE` · 1 day

### 14.4 File upload validation
**Status:** No file type or size validation exists for receipt and attachment uploads.
**What needs to happen:** Validate MIME type (allow only PDF, JPEG, PNG) and size (max 10MB) before generating R2 signed URLs.
**Effort:** `BE` · 2 hours

### 14.5 Database connection pooling
**Status:** The Prisma singleton works correctly for development. For production (Vercel serverless), connection pooling via Neon pgbouncer or Prisma Accelerate is required to avoid "too many connections" errors.
**Effort:** `Infra` · 2 hours

---

## SECTION 15 — Mobile & Accessibility (🟢 Nice to Have)

### 15.1 No mobile layout
**Status:** The sidebar is a fixed-width desktop element. On screens below 768px it is either hidden or overflows.
**What needs to happen:** Build a hamburger/drawer sidebar for mobile. Make all tables horizontally scrollable. Review table column priority for small screens.
**Effort:** `UI` · 2–3 days

### 15.2 No keyboard navigation or ARIA
**Status:** Interactive elements (dropdowns, modals, tables) have no ARIA roles, labels, or keyboard handling.
**Effort:** `UI` · 2 days

### 15.3 Dark mode not wired to system preference on SSR
**Status:** The `ThemeToggle` component uses `localStorage` which only runs client-side, causing a flash of the wrong theme on first load.
**What needs to happen:** Read the `prefers-color-scheme` media query server-side (via a cookie) to set the initial theme class.
**Effort:** `UI` · 4 hours

---

## Summary Table

| # | Item | Priority | Type | Effort |
|---|------|----------|------|--------|
| 1.1 | Auth.js not wired | 🔴 Blocker | Infra+BE | 1–2 days |
| 1.2 | Route protection off | 🔴 Blocker | BE | 2 hrs |
| 1.3 | Session has no real org context | 🔴 Blocker | BE | 4 hrs |
| 1.4 | Password reset not functional | 🔴 Blocker | BE+Infra | 4 hrs |
| 1.5 | Invite system not functional | 🔴 Blocker | UI+BE+Infra | 1 day |
| 2.1 | All pages use mock data | 🔴 Blocker | BE | 3–5 days |
| 2.2 | Server Actions don't persist | 🔴 Blocker | Infra | 2 hrs |
| 2.3 | Budget detail hardcoded | 🔴 Blocker | BE+UI | 4 hrs |
| 3.1 | Receipt upload not working | 🔴 Blocker | UI+BE+Infra | 1–2 days |
| 3.2 | Receipt allocation UI missing | 🔴 Blocker | UI+BE | 2 days |
| 3.3 | Expenditure report form missing | 🔴 Blocker | UI+BE | 2 days |
| 4.2 | Approve/reject not wired | 🟠 High | UI+BE | 4 hrs |
| 4.3 | Comments hardcoded | 🟠 High | UI+BE | 4 hrs |
| 4.4 | Attachment upload missing | 🟠 High | UI+BE | 4 hrs |
| 4.5 | Revision history not shown | 🟡 Medium | UI+BE | 1 day |
| 4.6 | Budget edit page is stub | 🟠 High | UI+BE | 4 hrs |
| 5.1 | Disbursement form missing | 🟠 High | UI+BE | 1 day |
| 5.2 | Disbursement approval missing | 🟠 High | UI+BE | 1 day |
| 6.1 | Record Income form missing | 🟠 High | UI+BE | 4 hrs |
| 6.2 | Income list uses mock data | 🟠 High | BE | 2 hrs |
| 7.1 | Add Account form missing | 🟠 High | UI+BE | 3 hrs |
| 7.2 | Transaction history mock | 🟠 High | BE | 2 hrs |
| 8.1 | Events page is stub | 🟡 Medium | UI+BE | 1 day |
| 8.2 | Event templates not built | 🟡 Medium | UI+BE | 2 days |
| 8.3 | Departments page is stub | 🟡 Medium | UI+BE | 1 day |
| 9.1 | Analytics uses mock data | 🟡 Medium | BE | 4 hrs |
| 9.4 | Export not implemented | 🟡 Medium | BE | 2–3 days |
| 10.1 | Emails not sent | 🟡 Medium | BE+Infra | 4 hrs |
| 10.5 | Notification count not live | 🟡 Medium | UI+BE | 4–8 hrs |
| 11.1 | Admin user mgmt read-only | 🟡 Medium | UI+BE | 1 day |
| 11.4 | Cross-org notification links | 🟡 Medium | UI+BE | 4 hrs |
| 14.x | Security hardening | 🟠 High | BE+Infra | 2–3 days |
| 15.1 | No mobile layout | 🟢 Nice | UI | 2–3 days |

---

## Recommended Build Order

### Phase 1 — Make it Real (Weeks 1–2)
Focus: connect the database and make core flows functional end-to-end.

1. Set up PostgreSQL + run migrations + seed (item 2.2)
2. Wire Auth.js with email/password (item 1.1)
3. Fix `requireSession()` with real session (item 1.3)
4. Enable route protection (item 1.2)
5. Migrate dashboard, budgets, and accounts pages to real data (item 2.1 — start here)
6. Wire budget approve/reject buttons (item 4.2)
7. Build Record Income form (item 6.1)

### Phase 2 — Complete the Money Lifecycle (Weeks 3–4)
Focus: disbursements, receipts, and accountability.

8. Build disbursement request form and approval (items 5.1, 5.2)
9. Wire R2 for file uploads (item 3.1)
10. Build receipt allocation UI (item 3.2)
11. Build expenditure report creation form (item 3.3)
12. Fix invitation system (item 1.5)
13. Send emails via Resend (item 10.1)

### Phase 3 — Complete the Admin Experience (Week 5)
Focus: user management, org settings, and secondary features.

14. Wire Admin user management edit/remove (item 11.1)
15. Wire settings forms (item 13.1)
16. Build events creation form (item 8.1)
17. Build departments creation form (item 8.3)
18. Connect analytics to real data (item 9.1)

### Phase 4 — Polish & Production (Week 6)
Focus: security, mobile, and performance.

19. Security hardening (items 14.1–14.5)
20. Audit log filtering (item 10.3)
21. Export to CSV/PDF (item 9.4)
22. Mobile layout (item 15.1)
23. Accessibility (item 15.2)
24. Dark mode SSR fix (item 15.3)
