import { prisma } from "@/lib/prisma/client";
import type { Prisma,MemberRole } from "@prisma/client";

export type OrganizationOverview = {
  id: string;
  name: string;
  slug: string;
  description: string;
  primaryColor: string;
  logoInitials: string;
  members: Array<{ id: string; userId: string }>;
  departmentCount: number;
  budgetCount: number;
  approvedBudgetCount: number;
  totalLiquidity: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  memberships: Array<{
    id: string;
    role: string;
    department: { id: string; name: string } | null;
    org: {
      id: string;
      name: string;
      slug: string;
      primaryColor: string;
      logoInitials: string;
    };
  }>;
};

export async function getOrganizationOverviews(): Promise<OrganizationOverview[]> {
  const organizations = await prisma.organization.findMany({
    include: {
      members: { select: { id: true, userId: true } },
      departments: { select: { id: true } },
      accounts: { select: { balance: true } },
      budgets: { select: { id: true, status: true } },
    },
    orderBy: { name: "asc" },
  });

  return organizations.map((organization: {
    id: string;
    name: string;
    slug: string;
    description: string;
    members: Array<{ id: string; userId: string }>;
    departments: Array<{ id: string }>;
    accounts: Array<{ balance: number }>;
    budgets: Array<{ id: string; status: string }>;
  }) => ({
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    description: organization.description,
    primaryColor: "#1F4B99",
    logoInitials: organization.name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    members: organization.members,
    departmentCount: organization.departments.length,
    budgetCount: organization.budgets.length,
    approvedBudgetCount: organization.budgets.filter((budget) => budget.status === "CHAIR_APPROVED").length,
    totalLiquidity: organization.accounts.reduce((sum, account) => sum + account.balance, 0),
  }));
}

export async function getPlatformStats(): Promise<{
  organizations: number;
  users: number;
  memberships: number;
}> {
  const [organizations, users, memberships] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.membership.count(),
  ]);

  return { organizations, users, memberships };
}

export async function getUsersWithMemberships(params?: {
  search?: string;
  orgId?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const { search, orgId, role, page = 1, pageSize = 20 } = params ?? {};

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

 if (orgId || role) {
  where.memberships = {
    some: {
      ...(orgId ? { organizationId: orgId } : {}),
      ...(role
        ? { role: role.toUpperCase() as MemberRole }
        : {}),
    },
  };
}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        memberships: {
          include: {
            organization: true,
            department: true,
          },
          orderBy: { joinedAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((user: {
      id: string;
      name: string;
      email: string;
      memberships: Array<{
        id: string;
        role: string;
        organization: { id: string; name: string; slug: string };
        department: { id: string; name: string } | null;
      }>;
    }) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      initials: user.name
        .split(" ")
        .map((part: string) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      memberships: user.memberships.map((membership) => ({
        id: membership.id,
        role: membership.role.toLowerCase(),
        department: membership.department,
        org: {
          id: membership.organization.id,
          name: membership.organization.name,
          slug: membership.organization.slug,
          primaryColor: "#1F4B99",
          logoInitials: membership.organization.name
            .split(" ")
            .map((part: string) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        },
      })),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export type OrganizationDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  timezone: string;
  createdAt: Date;
  initials: string;
  members: Array<{
    id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    department: { id: string; name: string } | null;
    isActive: boolean;
    joinedAt: Date;
    initials: string;
  }>;
  departments: Array<{
    id: string;
    name: string;
    description: string | null;
    head: { id: string; name: string } | null;
    isActive: boolean;
    memberCount: number;
  }>;
  invites: Array<{
    id: string;
    email: string;
    role: string;
    invitedBy: { id: string; name: string };
    expiresAt: Date;
    createdAt: Date;
  }>;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function getOrganizationDetail(id: string): Promise<OrganizationDetail | null> {
  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          department: { select: { id: true, name: true } },
        },
        orderBy: { joinedAt: "desc" },
      },
      departments: {
        include: {
          head: { select: { id: true, name: true } },
          memberships: { select: { id: true, isActive: true } },
        },
        orderBy: { name: "asc" },
      },
      invites: {
        include: {
          invitedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!org) return null;

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    description: org.description,
    logoUrl: org.logoUrl,
    timezone: org.timezone,
    createdAt: org.createdAt,
    initials: getInitials(org.name),
    members: org.members.map((m: {
      id: string; userId: string; role: string; isActive: boolean; joinedAt: Date;
      user: { id: string; name: string; email: string };
      department: { id: string; name: string } | null;
    }) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role.toLowerCase(),
      department: m.department,
      isActive: m.isActive,
      joinedAt: m.joinedAt,
      initials: getInitials(m.user.name),
    })),
    departments: org.departments.map((d: {
      id: string; name: string; description: string | null; isActive: boolean;
      head: { id: string; name: string } | null;
      memberships: Array<{ id: string; isActive: boolean }>;
    }) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      head: d.head,
      isActive: d.isActive,
      memberCount: d.memberships.filter((m: { isActive: boolean }) => m.isActive).length,
    })),
    invites: org.invites.map((i: {
      id: string; email: string; role: string; expiresAt: Date; createdAt: Date;
      invitedBy: { id: string; name: string };
    }) => ({
      id: i.id,
      email: i.email,
      role: i.role.toLowerCase(),
      invitedBy: i.invitedBy,
      expiresAt: i.expiresAt,
      createdAt: i.createdAt,
    })),
  };
}

export async function getInviteOptions() {
  const [organizations, departments] = await Promise.all([
    prisma.organization.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({
      select: { id: true, name: true, organizationId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { organizations, departments };
}
