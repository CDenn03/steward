import type {
  Budget, BudgetStatus, DashboardStats, FinancialAccount,
  AuditLog, Notification, Approval, Department, Event, ExpenditureReport,
} from "@/types";

// ─── Two organisations ────────────────────────────────────────────────────────

export const mockOrgs = [
  {
    id: "org-1",
    name: "Grace Community Church",
    slug: "grace-community",
    currency: "KES",
    logoInitials: "GC",
    primaryColor: "#1F4B99",
    fiscalYearStart: "01-01",
    memberCount: 12,
    description: "Nairobi Central Parish",
  },
  {
    id: "org-2",
    name: "Hope Foundation Kenya",
    slug: "hope-foundation",
    currency: "KES",
    logoInitials: "HF",
    primaryColor: "#15803D",
    fiscalYearStart: "07-01",
    memberCount: 8,
    description: "Non-profit · Education & Health",
  },
];

// Convenience single-org references (set after org is chosen)
export const mockOrg = mockOrgs[0];

// ─── Users ────────────────────────────────────────────────────────────────────
// A user can appear in multiple orgs with different roles

export const mockUsers = [
  { id: "user-1", name: "James Mwangi",    email: "james@steward.app",  initials: "JM" },
  { id: "user-2", name: "Sarah Kamau",     email: "sarah@steward.app",  initials: "SK" },
  { id: "user-3", name: "Peter Odhiambo", email: "peter@steward.app",  initials: "PO" },
  { id: "user-4", name: "Daniel Njoroge", email: "daniel@steward.app", initials: "DN" },
  { id: "user-5", name: "Grace Wanjiku",  email: "grace@steward.app",  initials: "GW" },
  { id: "user-6", name: "Ruth Achieng",   email: "ruth@steward.app",   initials: "RA" },
];

// ─── Memberships: which user is in which org with what role ──────────────────
export const mockMemberships = [
  // Grace Community Church
  { id: "mem-1", userId: "user-1", organizationId: "org-1", role: "finance",         departmentId: null },
  { id: "mem-2", userId: "user-2", organizationId: "org-1", role: "department_head", departmentId: "dept-1" },
  { id: "mem-3", userId: "user-3", organizationId: "org-1", role: "department_head", departmentId: "dept-3" },
  { id: "mem-4", userId: "user-4", organizationId: "org-1", role: "chairperson",     departmentId: null },
  { id: "mem-5", userId: "user-5", organizationId: "org-1", role: "finance",         departmentId: null },

  // Hope Foundation Kenya
  { id: "mem-6",  userId: "user-1", organizationId: "org-2", role: "admin",           departmentId: null },
  { id: "mem-7",  userId: "user-4", organizationId: "org-2", role: "chairperson",     departmentId: null },
  { id: "mem-8",  userId: "user-6", organizationId: "org-2", role: "finance",         departmentId: null },
  { id: "mem-9",  userId: "user-2", organizationId: "org-2", role: "department_head", departmentId: "dept-7" },
  { id: "mem-10", userId: "user-3", organizationId: "org-2", role: "department_head", departmentId: "dept-8" },
];

// ─── The currently logged-in user (james — member of BOTH orgs) ───────────────
export const mockCurrentUser = mockUsers[0];

// ─── Active session: which org + role is currently selected ──────────────────
export const mockActiveSession = {
  user: mockCurrentUser,
  org: mockOrgs[0],
  membership: mockMemberships[0], // finance in org-1
};

// ─── Departments ──────────────────────────────────────────────────────────────

export const mockDepartments: Department[] = [
  // Grace Community Church
  { id: "dept-1", name: "Youth Ministry",      organizationId: "org-1", allocatedAmount: 600000,  createdAt: new Date() },
  { id: "dept-2", name: "Worship & Arts",      organizationId: "org-1", allocatedAmount: 420000,  createdAt: new Date() },
  { id: "dept-3", name: "Outreach",            organizationId: "org-1", allocatedAmount: 300000,  createdAt: new Date() },
  { id: "dept-4", name: "Administration",      organizationId: "org-1", allocatedAmount: 1000000, createdAt: new Date() },
  { id: "dept-5", name: "Missions",            organizationId: "org-1", allocatedAmount: 400000,  createdAt: new Date() },
  { id: "dept-6", name: "Children's Ministry", organizationId: "org-1", allocatedAmount: 150000,  createdAt: new Date() },
  // Hope Foundation Kenya
  { id: "dept-7", name: "Education Programs",  organizationId: "org-2", allocatedAmount: 800000,  createdAt: new Date() },
  { id: "dept-8", name: "Health Outreach",     organizationId: "org-2", allocatedAmount: 600000,  createdAt: new Date() },
  { id: "dept-9", name: "Operations",          organizationId: "org-2", allocatedAmount: 400000,  createdAt: new Date() },
];

// ─── Budgets (scoped per org) ─────────────────────────────────────────────────

export const mockBudgets: Budget[] = [
  // Grace Community Church budgets
  {
    id: "bud-1", title: "Youth Annual Camp 2025",
    organizationId: "org-1", departmentId: "dept-1", department: mockDepartments[0],
    status: "chair_approved", totalAmount: 480000, approvedAmount: 480000, spentAmount: 326400,
    periodStart: new Date("2025-06-01"), periodEnd: new Date("2025-07-31"),
    createdAt: new Date("2025-04-10"), updatedAt: new Date("2025-05-15"),
  },
  {
    id: "bud-2", title: "Easter Conference 2025",
    organizationId: "org-1", departmentId: "dept-2", department: mockDepartments[1],
    status: "chair_approved", totalAmount: 320000, approvedAmount: 320000, spentAmount: 134400,
    periodStart: new Date("2025-04-01"), periodEnd: new Date("2025-04-30"),
    createdAt: new Date("2025-02-20"), updatedAt: new Date("2025-04-28"),
  },
  {
    id: "bud-3", title: "Missions Department Q2",
    organizationId: "org-1", departmentId: "dept-5", department: mockDepartments[4],
    status: "submitted", totalAmount: 340000,
    periodStart: new Date("2025-04-01"), periodEnd: new Date("2025-06-30"),
    createdAt: new Date("2025-05-28"), updatedAt: new Date("2025-06-01"),
  },
  {
    id: "bud-4", title: "Community Outreach Q2",
    organizationId: "org-1", departmentId: "dept-3", department: mockDepartments[2],
    status: "needs_changes", totalAmount: 215000, approvedAmount: 215000, spentAmount: 195650,
    periodStart: new Date("2025-04-01"), periodEnd: new Date("2025-06-30"),
    createdAt: new Date("2025-03-15"), updatedAt: new Date("2025-05-30"),
  },
  {
    id: "bud-5", title: "General Operations FY2026",
    organizationId: "org-1", departmentId: "dept-4", department: mockDepartments[3],
    status: "chair_approved", totalAmount: 960000, approvedAmount: 960000, spentAmount: 518400,
    periodStart: new Date("2025-01-01"), periodEnd: new Date("2025-12-31"),
    createdAt: new Date("2024-12-10"), updatedAt: new Date("2025-01-05"),
  },
  {
    id: "bud-6", title: "Music Equipment Fund",
    organizationId: "org-1", departmentId: "dept-2", department: mockDepartments[1],
    status: "draft", totalAmount: 185000,
    createdAt: new Date("2025-05-20"), updatedAt: new Date("2025-05-20"),
  },
  // Hope Foundation Kenya budgets
  {
    id: "bud-7", title: "School Scholarships Q3 2025",
    organizationId: "org-2", departmentId: "dept-7", department: mockDepartments[6],
    status: "chair_approved", totalAmount: 520000, approvedAmount: 520000, spentAmount: 312000,
    periodStart: new Date("2025-07-01"), periodEnd: new Date("2025-09-30"),
    createdAt: new Date("2025-06-10"), updatedAt: new Date("2025-06-20"),
  },
  {
    id: "bud-8", title: "Mobile Health Clinic — Kibera",
    organizationId: "org-2", departmentId: "dept-8", department: mockDepartments[7],
    status: "finance_approved", totalAmount: 380000,
    periodStart: new Date("2025-07-01"), periodEnd: new Date("2025-08-31"),
    createdAt: new Date("2025-06-15"), updatedAt: new Date("2025-06-25"),
  },
  {
    id: "bud-9", title: "Annual Operations FY2026",
    organizationId: "org-2", departmentId: "dept-9", department: mockDepartments[8],
    status: "submitted", totalAmount: 400000,
    periodStart: new Date("2025-07-01"), periodEnd: new Date("2026-06-30"),
    createdAt: new Date("2025-06-20"), updatedAt: new Date("2025-06-22"),
  },
];

// ─── Accounts ─────────────────────────────────────────────────────────────────

export const mockAccounts: FinancialAccount[] = [
  // Grace Community Church
  { id: "acc-1", organizationId: "org-1", name: "Main Operating Account", accountNumber: "1234 5678 9012", provider: "KCB Bank",    type: "bank",    balance: 1240500, currency: "KES", isActive: true, createdAt: new Date() },
  { id: "acc-2", organizationId: "org-1", name: "M-Pesa Till",            accountNumber: "Till 123456",   provider: "Safaricom",   type: "mpesa",   balance: 342150,  currency: "KES", isActive: true, createdAt: new Date() },
  { id: "acc-3", organizationId: "org-1", name: "Youth Ministry Fund",    accountNumber: "9876 5432",     provider: "Equity Bank", type: "savings", balance: 68400,   currency: "KES", isActive: true, createdAt: new Date() },
  // Hope Foundation Kenya
  { id: "acc-4", organizationId: "org-2", name: "Foundation Main Account", accountNumber: "5555 6666 7777", provider: "Absa Bank",   type: "bank",    balance: 2150000, currency: "KES", isActive: true, createdAt: new Date() },
  { id: "acc-5", organizationId: "org-2", name: "Donor Collections Till",  accountNumber: "Till 789012",   provider: "Safaricom",   type: "mpesa",   balance: 185000,  currency: "KES", isActive: true, createdAt: new Date() },
];

export const mockApprovals: Approval[] = [
  { id: "app-1", budgetId: "bud-3", type: "finance",     status: "pending", createdAt: new Date("2025-06-01") },
  { id: "app-2", budgetId: "bud-8", type: "chairperson", status: "pending", createdAt: new Date("2025-06-25") },
  { id: "app-3", budgetId: "bud-9", type: "finance",     status: "pending", createdAt: new Date("2025-06-22") },
];

export const mockAuditLogs: AuditLog[] = [
  { id: "aud-1", organizationId: "org-1", actorId: "user-2", actor: { id: "user-2", name: "Sarah Kamau",     email: "", role: "department_head", organizationId: "org-1", createdAt: new Date() }, entityType: "Budget",       entityId: "bud-3", action: "submitted",    createdAt: new Date(Date.now() - 2  * 3600000) },
  { id: "aud-2", organizationId: "org-1", actorId: "user-1", actor: { id: "user-1", name: "James Mwangi",    email: "", role: "finance",         organizationId: "org-1", createdAt: new Date() }, entityType: "Disbursement", entityId: "dis-1", action: "approved",     after: { amount: 48000 }, createdAt: new Date(Date.now() - 4  * 3600000) },
  { id: "aud-3", organizationId: "org-1", actorId: "user-3", actor: { id: "user-3", name: "Peter Odhiambo", email: "", role: "department_head", organizationId: "org-1", createdAt: new Date() }, entityType: "Receipt",      entityId: "rec-1", action: "uploaded",     after: { count: 3 },     createdAt: new Date(Date.now() - 28 * 3600000) },
  { id: "aud-4", organizationId: "org-1", actorId: "user-4", actor: { id: "user-4", name: "Daniel Njoroge", email: "", role: "chairperson",     organizationId: "org-1", createdAt: new Date() }, entityType: "Budget",       entityId: "bud-4", action: "needs_changes",                      createdAt: new Date(Date.now() - 32 * 3600000) },
  { id: "aud-5", organizationId: "org-1", actorId: "user-5", actor: { id: "user-5", name: "Grace Wanjiku",  email: "", role: "finance",         organizationId: "org-1", createdAt: new Date() }, entityType: "Income",       entityId: "inc-5", action: "recorded",     after: { amount: 120000 }, createdAt: new Date(Date.now() - 36 * 3600000) },
];

export const mockNotifications: Notification[] = [
  { id: "n-1", userId: "user-1", title: "Budget submitted for review",  message: "Sarah Kamau submitted Missions Dept Budget — KES 340,000", type: "approval", read: false, link: "/budgets/bud-3", createdAt: new Date(Date.now() - 2  * 3600000) },
  { id: "n-2", userId: "user-1", title: "Disbursement request pending", message: "Youth camp transport — KES 95,000 awaits your approval",   type: "approval", read: false, link: "/approvals",       createdAt: new Date(Date.now() - 4  * 3600000) },
  { id: "n-3", userId: "user-1", title: "Expenditure report uploaded",  message: "Outreach Q2 — 4 receipts attached by Peter Odhiambo",     type: "info",     read: true,                            createdAt: new Date(Date.now() - 26 * 3600000) },
  { id: "n-4", userId: "user-1", title: "Outstanding reports",          message: "7 accountability reports remain outstanding",              type: "warning",  read: true,                            createdAt: new Date(Date.now() - 48 * 3600000) },
];

export const mockDashboardStats: Record<string, DashboardStats> = {
  "org-1": {
    approvedBudget: 3240000, approvedBudgetDelta: 12,
    totalIncome: 1870000,    totalIncomeDelta: 8,
    totalExpenditure: 1420000, expenditurePct: 76,
    outstandingReports: 7,   outstandingReportsDelta: 2,
    accountabilityRate: 64,
  },
  "org-2": {
    approvedBudget: 920000, approvedBudgetDelta: 5,
    totalIncome: 2150000,   totalIncomeDelta: 18,
    totalExpenditure: 312000, expenditurePct: 34,
    outstandingReports: 2,  outstandingReportsDelta: 0,
    accountabilityRate: 88,
  },
};

export const mockEvents: Event[] = [
  { id: "ev-1", name: "Youth Annual Camp 2025",    organizationId: "org-1", departmentId: "dept-1", department: mockDepartments[0], startDate: new Date("2025-06-14"), endDate: new Date("2025-06-18"), status: "active",    createdAt: new Date() },
  { id: "ev-2", name: "Mid-Year Thanksgiving",     organizationId: "org-1", startDate: new Date("2025-06-21"), status: "planning",  createdAt: new Date() },
  { id: "ev-3", name: "Community Medical Camp",    organizationId: "org-1", departmentId: "dept-3", department: mockDepartments[2], startDate: new Date("2025-07-05"), status: "planning",  createdAt: new Date() },
  { id: "ev-4", name: "Leadership Retreat 2025",   organizationId: "org-1", startDate: new Date("2025-07-19"), status: "planning",  createdAt: new Date() },
  { id: "ev-5", name: "Kibera Health Day",         organizationId: "org-2", departmentId: "dept-8", department: mockDepartments[7], startDate: new Date("2025-07-26"), status: "planning",  createdAt: new Date() },
  { id: "ev-6", name: "Scholarship Awards 2025",   organizationId: "org-2", departmentId: "dept-7", department: mockDepartments[6], startDate: new Date("2025-08-15"), status: "planning",  createdAt: new Date() },
];

export const mockIncomeMonthly = [
  { month: "Jan", offerings: 180000, donations: 60000,  other: 20000 },
  { month: "Feb", offerings: 195000, donations: 45000,  other: 15000 },
  { month: "Mar", offerings: 210000, donations: 72000,  other: 30000 },
  { month: "Apr", offerings: 225000, donations: 84000,  other: 18000 },
  { month: "May", offerings: 228000, donations: 84000,  other: 30000 },
  { month: "Jun", offerings: 242000, donations: 90000,  other: 10000 },
];

export const mockExpenditureReports: ExpenditureReport[] = [
  { id: "exp-1", organizationId: "org-1", budgetId: "bud-4", departmentId: "dept-3", department: mockDepartments[2], status: "submitted", totalClaimed: 195650, submittedById: "user-3", submittedAt: new Date(Date.now() - 2 * 86400000), createdAt: new Date() },
  { id: "exp-2", organizationId: "org-1", budgetId: "bud-2", departmentId: "dept-2", department: mockDepartments[1], status: "submitted", totalClaimed: 134400, submittedById: "user-2", submittedAt: new Date(Date.now() - 3 * 86400000), createdAt: new Date() },
];

// ─── Admin user management (for the admin panel) ──────────────────────────────
export const mockAllUsers = mockUsers.map((u) => ({
  ...u,
  memberships: mockMemberships
    .filter((m) => m.userId === u.id)
    .map((m) => ({
      ...m,
      org: mockOrgs.find((o) => o.id === m.organizationId)!,
      department: mockDepartments.find((d) => d.id === m.departmentId) ?? null,
    })),
}));
