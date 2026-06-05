# Steward — User Journey Guide

> A practical walkthrough of how each role uses Steward, from first login through to a fully accounted event.

---

## Overview: The Cast

This guide follows four people at **Grace Community Church** as they manage the **Youth Annual Camp 2025**.

| Person | Role | Responsibility |
|--------|------|----------------|
| **Sarah Kamau** | Department Head — Youth | Plans the camp, creates and submits the budget, requests disbursements, submits receipts |
| **James Mwangi** | Finance Officer | Reviews budgets, manages accounts, approves disbursements, reconciles receipts |
| **Daniel Njoroge** | Chairperson | Gives final budget approval, monitors overall finances |
| **Grace Wanjiku** | Finance Officer | Records weekly income, assists James |

---

## Journey 1 — Getting Started (Admin Onboarding)

*This journey happens once when the organization first uses Steward.*

### 1.1 Admin creates the organization

The admin visits the Steward signup page, creates an account, and sets up the organization:

- Name: **Grace Community Church**
- Currency: **KES**
- Fiscal year start: **January 1**

### 1.2 Admin invites the team

From **Settings → Users → Invite**, the admin sends invitations:

```
james@gracecommunity.org   → Finance Officer
grace@gracecommunity.org   → Finance Officer
daniel@gracecommunity.org  → Chairperson
sarah@gracecommunity.org   → Department Head (Youth Ministry)
peter@gracecommunity.org   → Department Head (Outreach)
```

Each person receives an email with a unique invitation link.

### 1.3 Team members accept invitations

Sarah clicks her invite link and sees the invitation screen:

> *"James Mwangi has invited you to join Grace Community Church on Steward as a Department Head."*

She enters her name, confirms her email, sets a password, and is taken straight to her dashboard.

### 1.4 Admin creates departments

From **Settings → Departments**, the admin creates:

- Youth Ministry (head: Sarah Kamau)
- Worship & Arts
- Outreach (head: Peter Odhiambo)
- Administration
- Missions
- Children's Ministry

Annual allocations are set for each:

| Department | FY2025 Allocation |
|------------|-------------------|
| Youth Ministry | KES 600,000 |
| Worship & Arts | KES 420,000 |
| Outreach | KES 300,000 |
| Administration | KES 1,000,000 |
| Missions | KES 400,000 |
| Children's Ministry | KES 150,000 |

### 1.5 Finance adds accounts

James opens **Accounts → Add Account** and adds the organization's real accounts:

- **KCB Bank — Main Operating Account** (BANK) — opening balance KES 1,240,500
- **Safaricom M-Pesa Till** (MPESA) — opening balance KES 342,150
- **Equity Bank — Youth Ministry Fund** (SAVINGS) — opening balance KES 68,400

The dashboard now shows **KES 1,651,050** total liquid assets.

---

## Journey 2 — Planning the Camp (Department Head)

*Sarah plans the Youth Annual Camp 2025, scheduled for 14–18 June.*

### 2.1 Create the event

Sarah opens **Events → New Event**:

- Name: Youth Annual Camp 2025
- Department: Youth Ministry
- Start: 14 June 2025 · End: 18 June 2025

The event is saved in `PLANNING` status.

### 2.2 Create the budget

Sarah opens **Budgets → New Budget**. She fills in:

- **Title:** Youth Annual Camp 2025
- **Department:** Youth Ministry
- **Link to Event:** Youth Annual Camp 2025
- **Period:** 1 June 2025 – 31 July 2025

Then she adds her line items:

| Description | Category | Qty | Unit Cost | Total |
|-------------|----------|-----|-----------|-------|
| Bus hire — 2 buses return | Transport | 2 | KES 45,000 | KES 90,000 |
| Camp site accommodation (3 nights) | Accommodation | 80 | KES 1,500 | KES 120,000 |
| Full board meals | Catering | 80 | KES 1,200 | KES 96,000 |
| Guest speaker honorarium | Speaker Fees | 2 | KES 25,000 | KES 50,000 |
| Sound system rental | Equipment | 1 | KES 35,000 | KES 35,000 |
| T-shirts & camp materials | Printing | 80 | KES 600 | KES 48,000 |
| Contingency (10%) | Contingency | 1 | KES 41,000 | KES 41,000 |

The form shows a live total: **KES 480,000**.

The sidebar also shows that Youth's annual allocation is KES 600,000 and they have KES 120,000 of other approved budgets, so this budget fits within the remaining KES 480,000.

Sarah uploads a PDF quote from the camp venue as an attachment.

She clicks **Save as Draft** and reviews everything once more.

### 2.3 Submit for review

Satisfied with the numbers, Sarah clicks **Submit for Review**.

The budget status changes from `DRAFT` to `SUBMITTED`.

Sarah sees a confirmation:
> *"Budget submitted. James Mwangi and Grace Wanjiku will be notified to review it."*

Sarah can no longer edit the budget. She can only add comments.

---

## Journey 3 — Finance Review (Finance Officer)

*James receives a notification and reviews Sarah's budget.*

### 3.1 James gets notified

James's notification bell shows a new alert:

> **Budget submitted for review**
> Sarah Kamau submitted Youth Annual Camp 2025 — KES 480,000

He also sees it in his **Approvals** page under "Finance Review Queue".

### 3.2 James opens the budget

James opens the budget detail page. He sees:
- All line items with categories, quantities, and unit costs
- The venue quote attachment Sarah uploaded
- The approval workflow showing this is at the Finance Review stage

He has a question about accommodation.

### 3.3 James adds a comment

James types in the comments section:

> *"Hi Sarah — the KES 1,500 per person for accommodation: does this include meals or is it accommodation only? Needs to be clear to avoid double-counting with the catering line."*

Sarah receives a notification. She replies:

> *"Hi James — accommodation is bed only. The KES 1,200 per person for meals is a separate contract with a catering company."*

### 3.4 James approves

Satisfied with the clarification and the overall budget, James clicks **Approve**.

The status moves to `FINANCE_APPROVED`.

Daniel (Chairperson) receives a notification:
> **Budget ready for final approval**
> Youth Annual Camp 2025 — KES 480,000 — Finance Approved

---

## Journey 4 — Final Approval (Chairperson)

*Daniel gives final sign-off.*

### 4.1 Daniel reviews

Daniel opens his **Approvals** page. He sees the budget under "Chairperson Approvals". He reviews:
- The line items
- James's comment and Sarah's clarification
- The department allocation status

He's satisfied. He clicks **Final Approve**.

The budget status moves to `CHAIR_APPROVED`.

Both Sarah and James receive notifications:
> **Budget approved ✓**
> Youth Annual Camp 2025 has been fully approved. KES 480,000.

The event status is updated to `ACTIVE`.

---

## Journey 5 — Releasing Funds (Finance)

*With the budget approved, Sarah requests the money she needs to pay deposits.*

### 5.1 Sarah requests a disbursement

Sarah opens the approved budget and clicks **Request Disbursement**:

- **From Account:** KCB Bank — Main Operating Account
- **Amount:** KES 190,000
- **Description:** Camp deposits — transport (KES 90,000) + accommodation deposit (KES 100,000)

The request goes to James with status `PENDING`.

### 5.2 James approves the disbursement

James sees the disbursement in his Approvals queue. He reviews it:
- Is there enough in the account? ✓ (KES 1,240,500 balance)
- Does it match the budget? ✓ (Transport + Accommodation = KES 210,000 — deposit is partial)

James clicks **Release Funds**.

The KCB account balance decreases from KES 1,240,500 to **KES 1,050,500**.

A debit transaction is recorded:
```
Date: 28 May 2025
Account: KCB Bank — Main Operating Account
Type: Debit
Amount: KES 190,000
Description: Camp deposits — transport + accommodation
Balance after: KES 1,050,500
```

Sarah receives a notification:
> **Disbursement released**
> KES 190,000 has been released from KCB Bank for Youth Annual Camp 2025.

### 5.3 Second disbursement after the event

A week before the camp, Sarah requests a second disbursement for remaining costs:
- Remaining accommodation: KES 20,000
- Catering: KES 96,000
- Speaker fees: KES 50,000
- Sound system: KES 35,000
- T-shirts: KES 48,000

Total: KES 249,000

James reviews and releases this too. Total disbursed: KES 439,000 (out of KES 480,000 approved).

---

## Journey 6 — Recording Income (Finance)

*While the camp preparations are happening, Grace records the regular income.*

### 6.1 Weekly offering

Every Sunday, Grace opens **Income → Record Income**:

- **Account:** Safaricom M-Pesa Till
- **Category:** Offering
- **Amount:** KES 85,000
- **Description:** Sunday Tithe & Offering — 1 Jun 2025
- **Date:** 1 June 2025

The M-Pesa balance updates from KES 342,150 to **KES 427,150**.

### 6.2 Camp registrations

Grace also records the camp registration fees as they come in:

- **Account:** M-Pesa Till
- **Category:** Registration
- **Amount:** KES 30,000 (80 participants × KES 375 each)
- **Description:** Youth Camp 2025 registrations
- **Linked event:** Youth Annual Camp 2025

### 6.3 Income analytics

Daniel checks the Analytics page after the Sunday collection. He sees:
- KES 342,000 income this month
- +14% versus last month
- Offerings still the dominant category at 67%

---

## Journey 7 — Post-Camp Accountability (Department Head)

*The camp happens. 80 youth attend. It's a success. Now Sarah needs to account for every shilling.*

### 7.1 Collect all receipts

Sarah has collected physical receipts and also received digital invoices:

- Bus company invoice: KES 90,000 (PDF)
- Camp site invoice: KES 120,000 (PDF)
- Catering company invoice: KES 96,000 (PDF)
- Speaker 1 receipt: KES 25,000 (JPEG photo)
- Speaker 2 receipt: KES 25,000 (JPEG photo)
- Sound system invoice: KES 35,000 (PDF)
- T-shirts supplier receipt: KES 45,600 (KES 570 × 80 — slightly less than budgeted)

**Total receipts: KES 436,600** (vs KES 439,000 disbursed — KES 2,400 returned to petty cash)

### 7.2 Create the expenditure report

Sarah opens **Expenditures → New Report**:

- **Budget:** Youth Annual Camp 2025
- **Title:** Youth Annual Camp 2025 — Post-Event Accountability

### 7.3 Upload and allocate receipts

For each receipt, Sarah:
1. Uploads the file (PDF or photo)
2. Enters the amount, vendor, and date
3. Allocates it to the matching budget line item(s)

One case is slightly complex: the catering invoice covers both a camp day and a pre-camp meeting:

```
Receipt: Catering invoice — KES 96,000
  → Allocated to "Full board meals (youth)" KES 84,000
  → Allocated to "Pre-camp leadership dinner" KES 12,000
    (this was charged to a different line item)
```

Steward's many-to-many allocation handles this cleanly.

### 7.4 Submit the report

Once all receipts are uploaded and allocated, Sarah clicks **Submit Report**.

James receives a notification:
> **Expenditure report submitted**
> Youth Annual Camp 2025 — KES 436,600 claimed, 7 receipts attached

---

## Journey 8 — Finance Reconciliation (Finance Officer)

*James reviews the report and closes the books on the camp.*

### 8.1 James reviews the report

James opens the expenditure report. He can see:

| Budget Line | Budgeted | Claimed | Difference |
|-------------|----------|---------|------------|
| Transport | KES 90,000 | KES 90,000 | — |
| Accommodation | KES 120,000 | KES 120,000 | — |
| Catering | KES 96,000 | KES 96,000 | — |
| Speaker Fees | KES 50,000 | KES 50,000 | — |
| Equipment | KES 35,000 | KES 35,000 | — |
| T-shirts | KES 48,000 | KES 45,600 | -KES 2,400 |
| Contingency | KES 41,000 | KES 0 | -KES 41,000 |

Total variance: **KES 43,400 underspent** (good news — the contingency wasn't needed and the t-shirts came in cheaper).

James clicks on each receipt to view the file. Everything checks out.

### 8.2 James approves the report

James clicks **Approve Report**.

The expenditure report is marked `APPROVED`.

Sarah receives a notification:
> **Expenditure report approved ✓**
> Youth Annual Camp 2025 accountability has been reviewed and approved.

The "Outstanding Accountability" count on the dashboard decreases.

### 8.3 James reconciles the unspent balance

The KES 43,400 unspent was part of the disbursed funds. James records a deposit back to the main account:

- **Account:** KCB Bank — Main Operating Account
- **Category:** Other
- **Amount:** KES 43,400
- **Description:** Youth Camp 2025 — unspent funds returned

---

## Journey 9 — Chairperson Reviews the Month

*At the end of June, Daniel reviews the organization's financial health.*

### 9.1 Dashboard overview

Daniel opens Steward. His dashboard shows:

```
Approved Budget     KES 3.24M     +12% vs last quarter
Total Income        KES 1.87M     +8% year to date
Total Expenditure   KES 1.42M     76% of approved budget
Outstanding Reports     2          ↑1 from last month
```

### 9.2 Drill into analytics

Daniel opens **Analytics**. He sees:

**Department Budget vs Spend:**
- Youth has spent 68% of their approved budgets — on track
- Outreach is at 91% — a warning flag, James has already flagged it as needing changes

**Income Trend:**
- Consistent growth in offerings over the past 6 months
- Camp registrations gave a spike in June

**Budget Variance:**
- Youth Annual Camp: +KES 43,400 surplus
- Easter Conference: +KES 185,600 surplus (ended early)
- Community Outreach: only KES 19,350 remaining — needs monitoring

### 9.3 Review outstanding reports

Daniel sees 2 outstanding expenditure reports. He sends James a message noting the Outreach report is now 2 weeks overdue.

---

## Journey 10 — Inviting a New Team Member

*Sarah brings on a new youth worker, Kevin, who needs to upload receipts.*

### 10.1 Chairperson sends an invite

Daniel opens **Settings → Users → Invite**:

- Email: kevin@gracecommunity.org
- Role: Member
- Department: Youth Ministry

Kevin receives an invitation email.

### 10.2 Kevin creates his account

Kevin clicks the invite link, sets his name and password, and is taken to the dashboard. His view is minimal — he sees only the areas relevant to a Member:
- Notifications
- The ability to upload receipts to expenditure reports

He can't see financial accounts, approve budgets, or view analytics. Steward shows him exactly what he needs — nothing more.

---

## Journey 11 — A Budget That Needs Changes

*Not every budget goes through cleanly. Here's what happens when the chairperson asks for revisions.*

### 11.1 Outreach submits a budget

Peter (Outreach Department Head) submits "Community Medical Camp" with a transport line item of KES 80,000 for "vehicles" — no further detail.

### 11.2 Finance approves with a note

James approves at the finance stage but adds a comment:
> *"Finance approved. Note for chair: transport line needs more detail before final approval."*

### 11.3 Chairperson requests changes

Daniel reviews it and clicks **Request Changes**, with the comment:
> *"Please itemise transport costs: how many vehicles, what type, per day or fixed rate? Need this for audit purposes."*

The budget status changes to `NEEDS_CHANGES`.

### 11.4 Peter is notified

Peter receives a notification:
> **Budget needs changes**
> Community Medical Camp — changes requested by Chairperson. See comments.

Peter opens the budget and reads Daniel's comment. He edits the transport line item:
- Splits it into "Hired 4WD × 2 days @ KES 15,000/day" (KES 30,000)
- And "Matatu hire for volunteers × 3 trips @ KES 5,000" (KES 15,000)
- Adds "Driver allowances × 2 @ KES 2,500" (KES 5,000)

He re-submits. It goes back through finance (fast — James approves in minutes since the total hasn't changed) and then back to Daniel, who approves.

---

## Common Flows at a Glance

### "I need to plan an event budget"
`Budgets → New Budget → fill line items → Save Draft → Submit for Review`

### "I need to approve a budget"
`Approvals → Finance Review Queue (or Chairperson Approvals) → Review → Approve or Request Changes`

### "I need to release money for an approved budget"
`Budgets → [open budget] → Request Disbursement → Finance approves → funds released`

### "We received a donation"
`Income → Record Income → select account → enter amount and category → Save`

### "I need to account for money I spent"
`Expenditures → New Report → link to budget → upload receipts → allocate each → Submit`

### "Where did last month's money go?"
`Analytics → Budget Variance Report` or `Accounts → [account] → Transactions`

### "Something looks wrong — who changed this?"
`Audit Log → filter by entity type or actor → find the record`

---

## Notification Reference

| Event | Who gets notified |
|-------|------------------|
| Budget submitted | All Finance Officers |
| Budget approved by Finance | Dept Head + Chairperson |
| Budget needs changes | Dept Head |
| Budget finally approved | Dept Head + Finance |
| Budget rejected | Dept Head |
| Disbursement requested | Finance Officers |
| Disbursement released | Dept Head |
| Expenditure report submitted | Finance Officers |
| Expenditure report approved | Dept Head |
| Expenditure report needs info | Dept Head |
| Weekly overdue report reminder | Dept Heads with outstanding reports |
| New user invited | Invitee (email) |

---

## Glossary

| Term | Definition |
|------|------------|
| **Budget** | A formal proposal to spend a specific amount on a set of line items, requiring approval before any money is spent |
| **Budget Item** | A single line within a budget (e.g. "Transport — Bus hire × 2 @ KES 45,000") |
| **Disbursement** | A formal release of funds from an account to a department against an approved budget |
| **Expenditure Report** | The accountability document submitted after spending, containing receipts mapped to budget items |
| **Receipt Allocation** | The mapping of a receipt to one or more budget line items (many-to-many) |
| **Approval** | A formal review record — either Finance or Chairperson — on a budget |
| **Audit Log** | An immutable record of every state-changing action in the system |
| **Event Template** | A reusable set of default budget items for recurring events |
| **Outstanding Accountability** | Budgets that have been fully disbursed but have no approved expenditure report yet |
| **Soft Limit** | A department allocation that warns when exceeded but does not block submission |
| **Fiscal Year** | The 12-month financial reporting period configured per organization |

