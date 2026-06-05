// ─── Enums ───────────────────────────────────────────────────────────────────

export type BudgetStatus =
  | "draft"
  | "submitted"
  | "needs_changes"
  | "finance_approved"
  | "chair_approved"
  | "rejected";

export type ApprovalType = "finance" | "chairperson";

export type IncomeCategory =
  | "tithe"
  | "offering"
  | "donation"
  | "registration"
  | "fundraising"
  | "grant"
  | "other";

export type DisbursementStatus = "pending" | "approved" | "released" | "cancelled";

export type UserRole = "admin" | "finance" | "chairperson" | "department_head" | "member";

// ─── Core entities ───────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  currency: string;
  fiscalYearStart: string; // MM-DD
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  organizationId: string;
  departmentId?: string;
  createdAt: Date;
}

export interface Department {
  id: string;
  name: string;
  organizationId: string;
  headId?: string;
  head?: User;
  allocatedAmount?: number;
  createdAt: Date;
}

export interface Event {
  id: string;
  name: string;
  organizationId: string;
  departmentId?: string;
  department?: Department;
  templateId?: string;
  startDate: Date;
  endDate?: Date;
  status: "planning" | "active" | "completed" | "cancelled";
  createdAt: Date;
}

export interface BudgetCategory {
  id: string;
  name: string;
  organizationId: string;
  parentId?: string;
  createdAt: Date;
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  categoryId: string;
  category?: BudgetCategory;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface Budget {
  id: string;
  title: string;
  organizationId: string;
  departmentId?: string;
  department?: Department;
  eventId?: string;
  event?: Event;
  status: BudgetStatus;
  totalAmount: number;
  approvedAmount?: number;
  spentAmount?: number;
  periodStart?: Date;
  periodEnd?: Date;
  items?: BudgetItem[];
  submittedById?: string;
  submittedBy?: User;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Approval {
  id: string;
  budgetId: string;
  budget?: Budget;
  type: ApprovalType;
  status: "pending" | "approved" | "rejected" | "needs_changes";
  reviewerId?: string;
  reviewer?: User;
  comment?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface FinancialAccount {
  id: string;
  organizationId: string;
  name: string;
  accountNumber?: string;
  provider?: string;
  type: "bank" | "mpesa" | "cash" | "savings" | "project";
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Income {
  id: string;
  organizationId: string;
  accountId: string;
  account?: FinancialAccount;
  category: IncomeCategory;
  amount: number;
  description: string;
  recordedById: string;
  recordedBy?: User;
  eventId?: string;
  receivedAt: Date;
  createdAt: Date;
}

export interface Disbursement {
  id: string;
  organizationId: string;
  budgetId: string;
  budget?: Budget;
  accountId: string;
  account?: FinancialAccount;
  status: DisbursementStatus;
  totalAmount: number;
  requestedById: string;
  requestedBy?: User;
  approvedById?: string;
  releasedAt?: Date;
  description: string;
  createdAt: Date;
}

export interface ExpenditureReport {
  id: string;
  organizationId: string;
  budgetId: string;
  budget?: Budget;
  departmentId: string;
  department?: Department;
  status: "draft" | "submitted" | "approved" | "rejected";
  totalClaimed: number;
  totalApproved?: number;
  submittedById: string;
  submittedBy?: User;
  submittedAt?: Date;
  createdAt: Date;
}

export interface Receipt {
  id: string;
  expenditureReportId: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  amount: number;
  vendor?: string;
  receiptDate: Date;
  uploadedById: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  actorId: string;
  actor?: User;
  entityType: string;
  entityId: string;
  action: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "approval" | "warning" | "success";
  read: boolean;
  link?: string;
  createdAt: Date;
}

// ─── Dashboard / Analytics ───────────────────────────────────────────────────

export interface DashboardStats {
  approvedBudget: number;
  approvedBudgetDelta: number;
  totalIncome: number;
  totalIncomeDelta: number;
  totalExpenditure: number;
  expenditurePct: number;
  outstandingReports: number;
  outstandingReportsDelta: number;
  accountabilityRate: number;
}

export interface BudgetVariance {
  departmentName: string;
  allocated: number;
  spent: number;
  variance: number;
  pct: number;
}

export type MemberRole = "admin" | "finance" | "chairperson" | "department_head" | "member";
