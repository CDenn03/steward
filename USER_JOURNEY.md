# Steward — User Journey Guide
### Version 3 · June 2025

> A practical end-to-end walkthrough of how every role uses Steward, from first login through to a fully accounted event. Follows four real people across two organisations.

---

## The Cast

### Grace Community Church
| Person | Role | What they do |
|--------|------|-------------|
| **James Mwangi** | Finance Officer | Reviews budgets, manages accounts, approves disbursements |
| **Sarah Kamau** | Department Head — Youth | Plans, budgets, and accounts for Youth Ministry |
| **Peter Odhiambo** | Department Head — Outreach | Plans and accounts for Outreach work |
| **Daniel Njoroge** | Chairperson | Final budget approvals, overall financial oversight |
| **Grace Wanjiku** | Finance Officer | Records income, assists James |

### Hope Foundation Kenya
| Person | Role | What they do |
|--------|------|-------------|
| **James Mwangi** | Admin | Manages the platform, users, and org settings |
| **Daniel Njoroge** | Chairperson | Same person — chairs both organisations |
| **Ruth Achieng** | Finance Officer | Foundation finance |

> James and Daniel are members of **both** organisations with **different roles in each**. They use a single email to access both.

---

## Journey 0 — Platform Setup (Admin)

*This happens once when a new Steward instance is provisioned.*

### 0.1 Admin creates the first organisation

The system administrator logs in and opens **Admin → Organisations → New Organisation**:

- Name: **Grace Community Church**
- Slug: `grace-community` (used in URLs)
- Currency: **KES**
- Fiscal year start: **January 1**

### 0.2 Admin creates departments

From **Departments → Add Department**, the admin creates:

| Department | Annual Allocation |
|------------|-------------------|
| Youth Ministry | KES 600,000 |
| Worship & Arts | KES 420,000 |
| Outreach | KES 300,000 |
| Administration | KES 1,000,000 |
| Missions | KES 400,000 |
| Children's Ministry | KES 150,000 |

### 0.3 Admin invites users — the multi-org invite flow

The admin opens **Admin → Users → Invite User**. The two-step modal appears.

**Step 1 — User details:**
- Name: James Mwangi
- Email: james@steward.app

**Step 2 — Organisation roles:**
James is assigned to two organisations in a single invite:

| Organisation | Role | Department |
|--------------|------|------------|
| Grace Community Church | Finance Officer | None |
| Hope Foundation Kenya | Admin | None |

The admin clicks **"+ Add to another organisation"** before sending — one email, two org assignments.

James receives a single invitation email. He clicks the link, sets his password, and is immediately a member of both organisations.

The admin repeats this for all users:

| User | Grace Community Church | Hope Foundation Kenya |
|------|----------------------|----------------------|
| Sarah Kamau | Department Head — Youth Ministry | Department Head — Education |
| Peter Odhiambo | Department Head — Outreach | Department Head — Health |
| Daniel Njoroge | Chairperson | Chairperson |
| Grace Wanjiku | Finance Officer | — |
| Ruth Achieng | — | Finance Officer |

### 0.4 Finance adds accounts

James opens **Accounts → Add Account** and registers the real-world accounts:

**Grace Community Church:**
- KCB Bank — Main Operating Account (BANK) · balance KES 1,240,500
- Safaricom M-Pesa Till (MPESA) · balance KES 342,150
- Equity Bank — Youth Ministry Fund (SAVINGS) · balance KES 68,400

**Hope Foundation Kenya** (after switching org):
- Absa Bank — Foundation Main Account (BANK) · balance KES 2,150,000
- Safaricom — Donor Collections Till (MPESA) · balance KES 185,000

---

## Journey 1 — First Login (Any User)

*James logs in for the first time after receiving the invitation.*

### 1.1 Accept invitation

James clicks his email link and sees the invitation acceptance screen:

> *"James Mwangi — you've been invited to join Grace Community Church as Finance Officer and Hope Foundation Kenya as Admin."*

He enters his password and clicks **Accept & Create Account**.

### 1.2 Login on return visits

James visits `/login` and enters his email and password. After authentication, Steward detects he belongs to two organisations and redirects to `/org-picker`.

### 1.3 Organisation Picker

James sees two organisation cards:

```
┌─────────────────────────────────┐
│  GC  Grace Community Church     │
│      Finance Officer             │  →
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  HF  Hope Foundation Kenya      │
│      Administrator               │  →
└─────────────────────────────────┘
```

Each card shows the organisation's colour, initials, his role, and any department. He clicks **Grace Community Church**.

### 1.4 Splash screen

A full-screen transition in Grace Community Church's deep blue fills the display. The "GC" initials show briefly, then a checkmark appears as the workspace loads. After about 2 seconds, James lands on the dashboard.

The sidebar shows:
- "GC" colour badge with "Grace Community Church" as the active org
- His name and role ("Finance Officer") in the footer
- Nav items appropriate for his role

### 1.5 Switching to Hope Foundation

Later, James clicks the org selector in the sidebar. A dropdown shows both organisations. He selects Hope Foundation Kenya. The splash screen plays in green, then loads the Foundation's dashboard. All data — budgets, accounts, analytics — is now scoped to Hope Foundation.

---

## Journey 2 — Planning the Camp (Department Head)

*Sarah plans Youth Annual Camp 2025, scheduled 14–18 June.*

### 2.1 Sarah logs in and picks her org

Sarah logs in and sees one organisation card (she's only in Grace Community Church). She clicks it and goes straight through the splash screen to the dashboard.

Her dashboard shows the **Department Head** view:
- Her draft budgets
- Her submitted budgets awaiting review
- Her outstanding expenditure reports

### 2.2 Create the event

Sarah opens **Events → New Event**:

- Name: Youth Annual Camp 2025
- Department: Youth Ministry
- Start: 14 June 2025 · End: 18 June 2025
- Status: Planning

### 2.3 Create the budget

Sarah opens **Budgets → New Budget**. The form shows fields she has permission to fill:

- **Title:** Youth Annual Camp 2025
- **Department:** Youth Ministry *(pre-selected — her department)*
- **Link to Event:** Youth Annual Camp 2025
- **Period:** 1 June 2025 – 31 July 2025

She adds seven line items. The total calculates live as she types:

| Description | Category | Qty | Unit Cost | Total |
|-------------|----------|----:|----------:|------:|
| Bus hire — 2 buses return | Transport | 2 | 45,000 | 90,000 |
| Camp site accommodation (3 nights) | Accommodation | 80 | 1,500 | 120,000 |
| Full board meals | Catering | 80 | 1,200 | 96,000 |
| Guest speaker honorarium | Speaker Fees | 2 | 25,000 | 50,000 |
| Sound system rental | Equipment | 1 | 35,000 | 35,000 |
| T-shirts & camp materials | Printing | 80 | 600 | 48,000 |
| Contingency (10%) | Contingency | 1 | 41,000 | 41,000 |
| | | | **Total** | **480,000** |

The sidebar summary updates in real time. Sarah uploads a PDF venue quote as an attachment.

She clicks **Save as Draft** to preserve her work.

### 2.4 Submit for review

Sarah reviews the budget once more, then clicks **Submit for Review**.

Status changes: `DRAFT` → `SUBMITTED`

James and Grace receive an in-app notification and email:
> *Budget submitted for review: Youth Annual Camp 2025 — KES 480,000*

Sarah can no longer edit line items. She can add comments.

---

## Journey 3 — Finance Review (Finance Officer)

*James reviews Sarah's budget.*

### 3.1 James finds the budget

James's dashboard shows "3 Pending Reviews" in his Finance queue. He also receives the notification. He opens the budget detail page.

He can see:
- All seven line items
- The venue quote attachment
- The approval workflow indicator (Finance Review is the active step)

### 3.2 James adds a comment

James has a question about the accommodation line:

> *"Hi Sarah — does the KES 1,500 per person for accommodation include meals, or is it bed-only? Need clarity to confirm this doesn't overlap with the catering line."*

### 3.3 Sarah replies

Sarah receives a notification. She opens the comment thread and replies:

> *"Hi James — bed-only. The catering is a separate contract with a different supplier. I can attach the catering quote if it helps."*

She uploads the catering quote. James reviews it.

### 3.4 James approves

Satisfied, James clicks **Approve**. He may add an optional note: *"Approved. Both quotes verified."*

Status changes: `SUBMITTED` → `FINANCE_APPROVED`

Daniel (Chairperson) receives a notification:
> *Budget ready for final approval: Youth Annual Camp 2025 — Finance Approved*

---

## Journey 4 — Chairperson Approval

*Daniel gives final sign-off — from whichever org he's currently in.*

### 4.1 Daniel is in Hope Foundation

Daniel is currently working in Hope Foundation Kenya when he receives the notification about the Grace Community Church budget. He clicks the notification link.

Steward detects the notification is for a different organisation. It triggers the splash screen transition to Grace Community Church, then opens the budget detail directly.

*(Note: this cross-org deep-link behaviour is a planned feature — see the Incomplete Items list.)*

### 4.2 Daniel reviews

Daniel opens the Approvals page and sees the budget in his Chairperson queue. He reviews:
- Line items and totals
- James's approval note
- Sarah's catering quote

He's satisfied. He clicks **Final Approve**.

Status changes: `FINANCE_APPROVED` → `CHAIR_APPROVED`

Both Sarah and James receive notifications:
> *Budget fully approved ✓ — Youth Annual Camp 2025, KES 480,000*

The event status updates to `ACTIVE`.

---

## Journey 5 — A Budget That Needs Changes

*Not every budget goes through cleanly. Peter's Outreach budget gets kicked back.*

### 5.1 Peter submits

Peter submits "Community Outreach Q2" with a transport line: "Vehicles — KES 80,000" — no further detail.

### 5.2 James approves at finance

James approves but leaves a comment: *"Finance approved. Flagging for chair: transport line needs more detail for audit compliance."*

### 5.3 Daniel requests changes

Daniel reads James's note and clicks **Request Changes**:
> *"Please itemise transport. How many vehicles? What type? Fixed rate or per-day? Need this to satisfy our audit requirements."*

Status changes: → `NEEDS_CHANGES`

### 5.4 Peter revises and resubmits

Peter receives a notification. He opens the budget, reads the comment, and edits the transport section, splitting it into three specific lines:

| Description | Category | Qty | Unit Cost | Total |
|-------------|----------|----:|----------:|------:|
| 4WD hire × 2 days | Transport | 2 | 15,000 | 30,000 |
| Matatu hire for volunteers (3 trips) | Transport | 3 | 5,000 | 15,000 |
| Driver allowances | Transport | 2 | 2,500 | 5,000 |

Total transport: unchanged at KES 50,000. Peter resubmits.

A `BudgetRevision` snapshot is saved recording the previous state. The budget returns to Finance Review. James approves in minutes (total unchanged), and Daniel gives final approval.

---

## Journey 6 — Releasing Funds (Disbursement)

*Sarah needs funds to pay the camp deposits.*

### 6.1 Request first disbursement

Sarah opens the approved budget and clicks **Request Disbursement**:

- **From Account:** KCB Bank — Main Operating Account
- **Amount:** KES 190,000
- **Description:** Camp deposits — transport (KES 90,000) + accommodation deposit (KES 100,000)

The request appears in James's Approvals queue as `PENDING`.

### 6.2 James releases

James reviews the request. The account has KES 1,240,500 — sufficient. He clicks **Release Funds**.

- Status changes: `PENDING` → `RELEASED`
- KCB account balance: KES 1,240,500 → **KES 1,050,500**
- A debit `AccountTransaction` is recorded

Sarah receives a notification: *"Disbursement of KES 190,000 released from KCB Bank."*

### 6.3 Second disbursement pre-camp

A week before camp, Sarah requests a second disbursement of KES 249,000 for remaining costs. James reviews and releases. Total disbursed: KES 439,000.

---

## Journey 7 — Recording Income (Finance Officer)

*Grace records weekly income throughout the camp planning period.*

### 7.1 Sunday offerings

Every Sunday, Grace opens **Income → Record Income**:

- **Account:** M-Pesa Till
- **Category:** Offering
- **Amount:** KES 85,000
- **Description:** Sunday Tithe & Offering — 1 Jun 2025
- **Date:** 1 June 2025

The M-Pesa balance updates immediately. An income record is created and an audit log entry written.

### 7.2 Camp registrations

Grace records the registration fees as they come in:

- **Account:** M-Pesa Till
- **Category:** Registration
- **Amount:** KES 30,000 (80 participants × KES 375)
- **Linked Event:** Youth Annual Camp 2025

Linking the registration fees to the event means the Event financial summary will show income of KES 30,000 alongside the KES 480,000 budget — giving a net cost picture.

---

## Journey 8 — Post-Camp Accountability (Department Head)

*The camp runs successfully. Now Sarah must account for every shilling.*

### 8.1 Collect receipts

Sarah has:
- Bus company invoice: KES 90,000 (PDF)
- Camp site invoice: KES 120,000 (PDF)
- Catering invoice: KES 96,000 (PDF)
- Speaker 1 receipt: KES 25,000 (JPEG)
- Speaker 2 receipt: KES 25,000 (JPEG)
- Sound system invoice: KES 35,000 (PDF)
- T-shirts receipt: KES 45,600 (KES 570 × 80 — slight saving vs. KES 600 budgeted)

**Total receipts: KES 436,600** (KES 43,400 less than disbursed — unspent funds returned)

### 8.2 Create expenditure report

Sarah opens **Expenditures → New Report**:

- **Budget:** Youth Annual Camp 2025
- **Title:** Youth Annual Camp 2025 — Post-Event Report

### 8.3 Upload and allocate receipts

For each receipt, Sarah:
1. Uploads the file
2. Enters amount, vendor, and receipt date
3. Allocates to the matching budget line item

One receipt requires a split allocation. The catering invoice covers both the main camp meals and a pre-camp leaders' briefing:

```
Catering invoice — KES 96,000
  → "Full board meals" budget line: KES 84,000
  → "Pre-camp leaders' dinner" budget line: KES 12,000
```

Steward's many-to-many allocation handles this without workarounds.

### 8.4 Submit the report

Sarah clicks **Submit Report**.

James receives a notification: *"Expenditure report submitted — Youth Annual Camp 2025, KES 436,600 claimed, 7 receipts."*

---

## Journey 9 — Finance Reconciliation (Finance Officer)

*James reviews the report and closes the books.*

### 9.1 James reviews

James opens the expenditure report. He sees each receipt mapped to budget lines:

| Budget Line | Budgeted | Claimed | Variance |
|-------------|--------:|--------:|---------:|
| Transport | 90,000 | 90,000 | — |
| Accommodation | 120,000 | 120,000 | — |
| Catering | 96,000 | 96,000 | — |
| Speaker Fees | 50,000 | 50,000 | — |
| Equipment | 35,000 | 35,000 | — |
| T-shirts | 48,000 | 45,600 | -2,400 |
| Contingency | 41,000 | 0 | -41,000 |
| **Total** | **480,000** | **436,600** | **-43,400** |

James clicks each receipt file to verify. Everything matches.

### 9.2 Approve

James clicks **Approve Report**. Status changes to `APPROVED`.

Sarah receives notification: *"Expenditure report approved ✓ — Youth Annual Camp 2025."*

### 9.3 Return unspent funds

James records a KES 43,400 credit back to the KCB account:

- **Account:** KCB Bank — Main Operating Account
- **Category:** Other
- **Amount:** KES 43,400
- **Description:** Youth Camp 2025 — unspent funds returned

---

## Journey 10 — Chairperson Monthly Review

*At the end of June, Daniel reviews both organisations.*

### 10.1 Grace Community Church dashboard

Daniel's dashboard shows:

```
Approved Budget     KES 3.24M     +12% vs last quarter
Total Income        KES 1.87M     +8% year to date
Total Expenditure   KES 1.42M     76% of approved budget
Outstanding Reports     2         ↑1 from last month
```

### 10.2 Analytics drill-down

Daniel opens **Analytics**:

- **Department Budget vs Spend:** Youth at 68% — healthy. Outreach at 91% — flagged in orange.
- **Income Trend:** Consistent growth. Camp registrations created a June spike.
- **Budget Variance Report:** Youth Camp: +KES 43,400 surplus (good). Outreach: KES 19,350 remaining — monitoring.

### 10.3 Switch to Hope Foundation

Daniel clicks the org selector and switches to Hope Foundation Kenya. The splash screen transitions in green. His dashboard now shows Foundation data:

```
Approved Budget     KES 920,000
Total Income        KES 2,150,000   +18% year to date
Total Expenditure   KES 312,000
Outstanding Reports     2
```

He reviews the Mobile Health Clinic budget (Finance Approved, waiting for his final approval) and approves it.

---

## Journey 11 — Cross-Org User (Admin Hat)

*James, wearing his Hope Foundation Admin hat, needs to add a new finance volunteer.*

### 11.1 Switch to Hope Foundation

James switches to Hope Foundation via the org dropdown in the sidebar.

### 11.2 Invite a new user

James opens **Admin → Users → Invite User**:

**Step 1:**
- Name: Kevin Otieno
- Email: kevin@hopefoundation.org

**Step 2:**
James assigns Kevin to **Hope Foundation Kenya** as **Member** (no department). This gives Kevin the ability to upload receipts to expenditure reports but no financial access.

Kevin receives the email, clicks the link, creates his account, and lands on the Hope Foundation dashboard with his limited view.

---

## Common Flows at a Glance

### "I need to budget for an event"
`Events → New Event` → `Budgets → New Budget` → link to event → add line items → `Submit for Review`

### "I need to approve a budget"
`Approvals` → Finance Review Queue or Chairperson Queue → open budget → `Approve` or `Request Changes`

### "I need to release money"
`Budgets` → open approved budget → `Request Disbursement` → Finance approves → `Release Funds`

### "We received a donation"
`Income → Record Income` → select account → enter amount and category → `Save`

### "I need to account for what I spent"
`Expenditures → New Report` → link to budget → upload receipts → allocate each → `Submit`

### "I want to see overall financial health"
`Analytics` → Department Budget vs Spend + Income Trend + Budget Variance Table

### "Something looks wrong — who changed this?"
`Audit Log` → filter by entity type, actor, or date

### "I need to add a user to a second organisation"
`Admin → Users` → find user → expand → `+ Add to organisation`

### "I want to switch to a different organisation"
Sidebar org selector → click dropdown → choose organisation → splash screen loads

---

## Notification Reference

| Event | Who gets notified |
|-------|------------------|
| Budget submitted | All Finance Officers in the org |
| Budget finance-approved | Dept Head + Chairperson |
| Budget needs changes | Dept Head |
| Budget fully approved | Dept Head + all Finance Officers |
| Budget rejected | Dept Head |
| Disbursement requested | Finance Officers |
| Disbursement released | Dept Head who requested it |
| Expenditure report submitted | Finance Officers |
| Expenditure report approved | Dept Head |
| Expenditure report needs info | Dept Head |
| Weekly overdue report reminder | Dept Heads with outstanding reports |
| New user invited | Invitee (email only) |
| Added to new organisation | User (email + in-app) |

---

## Glossary

| Term | Definition |
|------|------------|
| **Organisation** | A top-level tenant. All financial data belongs to one organisation and is invisible to others. |
| **Membership** | A user's relationship to an organisation — carries their role and optional department. |
| **Budget** | A formal spending proposal with line items, requiring two-stage approval before funds can be released. |
| **Budget Item** | A single line in a budget: description, category, quantity, unit cost. |
| **Approval** | A formal review decision (Finance or Chairperson) on a budget — approved, rejected, or needs changes. |
| **Disbursement** | A formal, auditable release of funds from an account against an approved budget. |
| **Expenditure Report** | Post-spending accountability document containing receipts mapped to budget lines. |
| **Receipt Allocation** | The mapping of a receipt to one or more budget line items (many-to-many). |
| **Outstanding Accountability** | An approved, disbursed budget with no approved expenditure report. |
| **Event Template** | A reusable set of default budget categories and line items for recurring events. |
| **Soft Limit** | A department allocation that warns when exceeded but does not block budget submission. |
| **Audit Log** | Append-only record of every state-changing action with before/after snapshots. |
| **Org Picker** | The screen shown after login where a multi-org user chooses which organisation to work in. |
| **Splash Screen** | The branded transition animation that plays when loading an organisation's workspace. |
