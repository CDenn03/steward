/**
 * Steward — Database Seed
 * Run with: pnpm db:seed
 */
async function main() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { hashSync } = require("bcryptjs");
  const prisma = new PrismaClient({ log: ["warn", "error"] });

  console.log("🌱  Seeding Steward database…\n");

  const DEFAULT_PASSWORD = hashSync("Password123", 10);

  try {
    // ─── Platform Super User ──────────────────────────────────────
    const superUser = await prisma.user.upsert({
      where: { email: "admin@steward.app" },
      update: { password: DEFAULT_PASSWORD },
      create: {
        name: "Platform Admin",
        email: "admin@steward.app",
        password: DEFAULT_PASSWORD,
      },
    });
    console.log("✓  Super user:", superUser.email);

    // ─── Organization ─────────────────────────────────────────────
    const org = await prisma.organization.upsert({
      where: { slug: "grace-community" },
      update: {},
      create: {
        name: "Grace Community Church",
        slug: "grace-community",
        currency: "KES",
        fiscalYearStart: "01-01",
        timezone: "Africa/Nairobi",
      },
    });
    console.log("✓  Organization:", org.name);

    // ─── Users ────────────────────────────────────────────────────
    const users = await Promise.all([
      prisma.user.upsert({ where: { email: "james@gracecommunity.org" },   update: { password: DEFAULT_PASSWORD }, create: { name: "James Mwangi",    email: "james@gracecommunity.org",   password: DEFAULT_PASSWORD } }),
      prisma.user.upsert({ where: { email: "sarah@gracecommunity.org" },   update: { password: DEFAULT_PASSWORD }, create: { name: "Sarah Kamau",     email: "sarah@gracecommunity.org",   password: DEFAULT_PASSWORD } }),
      prisma.user.upsert({ where: { email: "peter@gracecommunity.org" },   update: { password: DEFAULT_PASSWORD }, create: { name: "Peter Odhiambo", email: "peter@gracecommunity.org",   password: DEFAULT_PASSWORD } }),
      prisma.user.upsert({ where: { email: "chair@gracecommunity.org" },   update: { password: DEFAULT_PASSWORD }, create: { name: "Daniel Njoroge", email: "chair@gracecommunity.org",   password: DEFAULT_PASSWORD } }),
      prisma.user.upsert({ where: { email: "grace@gracecommunity.org" },   update: { password: DEFAULT_PASSWORD }, create: { name: "Grace Wanjiku",  email: "grace@gracecommunity.org",   password: DEFAULT_PASSWORD } }),
    ]);
    console.log("✓  Users:", users.length, "(password: password123)");

    // ─── Super user gets PLATFORM_ADMIN membership in org ─────────
    await prisma.membership.upsert({
      where: { userId_organizationId: { userId: superUser.id, organizationId: org.id } },
      update: {},
      create: { userId: superUser.id, organizationId: org.id, role: "PLATFORM_ADMIN" },
    });

    // ─── Departments ──────────────────────────────────────────────
    const deptNames = ["Youth Ministry", "Worship & Arts", "Outreach", "Administration", "Missions", "Children's Ministry"];
    const departments = await Promise.all(
      deptNames.map((name) =>
        prisma.department.upsert({
          where: { id: `dept-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}` },
          update: {},
          create: { id: `dept-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`, organizationId: org.id, name },
        })
      )
    );
    console.log("✓  Departments:", departments.length);

    // ─── Memberships ──────────────────────────────────────────────
    const membershipDefs = [
      { user: users[0], role: "FINANCE",         departmentId: null },
      { user: users[3], role: "CHAIRPERSON",     departmentId: null },
      { user: users[1], role: "DEPARTMENT_HEAD", departmentId: departments[4].id },
      { user: users[2], role: "DEPARTMENT_HEAD", departmentId: departments[2].id },
      { user: users[4], role: "FINANCE",         departmentId: null },
    ];
    for (const m of membershipDefs) {
      await prisma.membership.upsert({
        where: { userId_organizationId: { userId: m.user.id, organizationId: org.id } },
        update: {},
        create: { userId: m.user.id, organizationId: org.id, role: m.role, departmentId: m.departmentId },
      });
    }
    console.log("✓  Memberships created");

    // ─── Budget Categories ─────────────────────────────────────────
    const categoryNames = [
      "Transport", "Accommodation", "Catering", "Equipment",
      "Printing & Stationery", "Communication", "Speaker Fees", "Contingency",
    ];
    const categories = await Promise.all(
      categoryNames.map((name, i) =>
        prisma.budgetCategory.upsert({
          where: { id: `cat-${i + 1}` },
          update: {},
          create: { id: `cat-${i + 1}`, organizationId: org.id, name },
        })
      )
    );
    console.log("✓  Budget categories:", categories.length);

    // ─── Financial Accounts ───────────────────────────────────────
    const accounts = await Promise.all([
      prisma.financialAccount.upsert({ where: { id: "acc-1" }, update: { balance: 1240500 }, create: { id: "acc-1", organizationId: org.id, name: "Main Operating Account", provider: "KCB Bank",     type: "BANK",    balance: 1240500, currency: "KES" } }),
      prisma.financialAccount.upsert({ where: { id: "acc-2" }, update: { balance: 342150  }, create: { id: "acc-2", organizationId: org.id, name: "M-Pesa Till",            provider: "Safaricom",   type: "MPESA",   balance: 342150,  currency: "KES" } }),
      prisma.financialAccount.upsert({ where: { id: "acc-3" }, update: { balance: 68400   }, create: { id: "acc-3", organizationId: org.id, name: "Youth Ministry Fund",     provider: "Equity Bank", type: "SAVINGS", balance: 68400,   currency: "KES" } }),
    ]);
    console.log("✓  Accounts:", accounts.length);

    // ─── Events ───────────────────────────────────────────────────
    await prisma.event.upsert({
      where: { id: "ev-youth-camp-2025" },
      update: {},
      create: {
        id: "ev-youth-camp-2025",
        organizationId: org.id,
        departmentId: departments[0].id,
        name: "Youth Annual Camp 2025",
        status: "ACTIVE",
        startDate: new Date("2025-06-14"),
        endDate:   new Date("2025-06-18"),
      },
    });
    console.log("✓  Events created");

    // ─── Budgets ──────────────────────────────────────────────────
    const existingBudget = await prisma.budget.findUnique({ where: { id: "bud-youth-camp" } });
    if (!existingBudget) {
      await prisma.budget.create({
        data: {
          id: "bud-youth-camp",
          organizationId: org.id,
          departmentId: departments[0].id,
          eventId: "ev-youth-camp-2025",
          title: "Youth Annual Camp 2025",
          status: "CHAIR_APPROVED",
          periodStart: new Date("2025-06-01"),
          periodEnd:   new Date("2025-07-31"),
          submittedById: users[1].id,
          submittedAt:   new Date("2025-04-15"),
          items: {
            create: [
              { categoryId: categories[0].id, description: "Bus hire — 2 buses return",          quantity: 2,  unitCost: 45000, totalCost: 90000  },
              { categoryId: categories[1].id, description: "Camp site accommodation (3 nights)", quantity: 80, unitCost:  1500, totalCost: 120000 },
              { categoryId: categories[2].id, description: "Full board meals",                   quantity: 80, unitCost:  1200, totalCost: 96000  },
              { categoryId: categories[6].id, description: "Guest speaker honorarium",           quantity: 2,  unitCost: 25000, totalCost: 50000  },
              { categoryId: categories[3].id, description: "Sound system rental",                quantity: 1,  unitCost: 35000, totalCost: 35000  },
              { categoryId: categories[4].id, description: "T-shirts & camp materials",          quantity: 80, unitCost:   600, totalCost: 48000  },
              { categoryId: categories[7].id, description: "Contingency (10%)",                  quantity: 1,  unitCost: 41000, totalCost: 41000  },
            ],
          },
        },
      });
    }

    const existingMissions = await prisma.budget.findUnique({ where: { id: "bud-missions-q2" } });
    if (!existingMissions) {
      await prisma.budget.create({
        data: {
          id: "bud-missions-q2",
          organizationId: org.id,
          departmentId: departments[4].id,
          title: "Missions Department Q2 2025",
          status: "SUBMITTED",
          periodStart: new Date("2025-04-01"),
          periodEnd:   new Date("2025-06-30"),
          submittedById: users[1].id,
          submittedAt:   new Date("2025-06-01"),
          items: {
            create: [
              { categoryId: categories[0].id, description: "Travel to mission sites",     quantity: 4,   unitCost: 25000, totalCost: 100000 },
              { categoryId: categories[2].id, description: "Community feeding programme", quantity: 200, unitCost:   500, totalCost: 100000 },
              { categoryId: categories[4].id, description: "Bibles and tracts",           quantity: 500, unitCost:   280, totalCost: 140000 },
            ],
          },
        },
      });
    }

    const existingOps = await prisma.budget.findUnique({ where: { id: "bud-general-ops" } });
    if (!existingOps) {
      await prisma.budget.create({
        data: {
          id: "bud-general-ops",
          organizationId: org.id,
          departmentId: departments[3].id,
          title: "General Operations FY2026",
          status: "CHAIR_APPROVED",
          periodStart: new Date("2025-01-01"),
          periodEnd:   new Date("2025-12-31"),
          submittedById: users[0].id,
          submittedAt:   new Date("2024-12-15"),
          items: {
            create: [
              { categoryId: categories[5].id, description: "Internet & phone bills",       quantity: 12, unitCost: 8000,  totalCost: 96000  },
              { categoryId: categories[3].id, description: "Office equipment maintenance", quantity: 1,  unitCost: 45000, totalCost: 45000  },
              { categoryId: categories[4].id, description: "Printing & office supplies",   quantity: 12, unitCost: 5000,  totalCost: 60000  },
              { categoryId: categories[7].id, description: "Contingency",                  quantity: 1,  unitCost: 59000, totalCost: 59000  },
            ],
          },
        },
      });
    }
    console.log("✓  Budgets created");

    // ─── Approvals ────────────────────────────────────────────────
    await prisma.approval.upsert({
      where: { id: "app-missions-finance" },
      update: {},
      create: { id: "app-missions-finance", budgetId: "bud-missions-q2", type: "FINANCE", status: "PENDING" },
    });
    console.log("✓  Approvals created");

    // ─── Income Records ───────────────────────────────────────────
    const incomeData = [
      { id: "inc-1", category: "OFFERING",     amount: 85000,  description: "Sunday Tithe & Offering — 1 Jun",    accountId: accounts[0].id },
      { id: "inc-2", category: "REGISTRATION", amount: 30000,  description: "Youth Camp Registrations",           accountId: accounts[1].id },
      { id: "inc-3", category: "DONATION",      amount: 50000,  description: "Anonymous Donation — Building Fund", accountId: accounts[0].id },
      { id: "inc-4", category: "OFFERING",      amount: 120000, description: "Easter Conference Offering",         accountId: accounts[1].id },
      { id: "inc-5", category: "GRANT",         amount: 150000, description: "Community Medical Camp Grant",       accountId: accounts[0].id },
    ];
    for (const [i, inc] of incomeData.entries()) {
      await prisma.income.upsert({
        where: { id: inc.id },
        update: {},
        create: { ...inc, organizationId: org.id, recordedById: users[i % 2 === 0 ? 0 : 4].id, receivedAt: new Date(Date.now() - i * 86400000 * 3) },
      });
    }
    console.log("✓  Income records created");

    // ─── Audit Logs ───────────────────────────────────────────────
    const auditData = [
      { id: "aud-1", actorId: users[1].id, entityType: "Budget",       entityId: "bud-missions-q2", action: "submitted",     after: { status: "SUBMITTED" }                },
      { id: "aud-2", actorId: users[0].id, entityType: "Disbursement", entityId: "dis-1",           action: "approved",      after: { amount: 48000 }                      },
      { id: "aud-3", actorId: users[2].id, entityType: "Receipt",      entityId: "rec-1",           action: "uploaded",      after: { count: 3 }                           },
      { id: "aud-4", actorId: users[3].id, entityType: "Budget",       entityId: "bud-missions-q2", action: "needs_changes", after: { comment: "Itemise transport costs" } },
      { id: "aud-5", actorId: users[4].id, entityType: "Income",       entityId: "inc-1",           action: "recorded",      after: { amount: 120000 }                     },
    ];
    for (const [i, entry] of auditData.entries()) {
      await prisma.auditLog.upsert({
        where: { id: entry.id },
        update: {},
        create: { ...entry, organizationId: org.id, createdAt: new Date(Date.now() - i * 7200000) },
      });
    }
    console.log("✓  Audit logs created");

    // ─── Notifications ────────────────────────────────────────────
    const notifData = [
      { id: "notif-1", userId: users[0].id, title: "Budget submitted for review",  message: "Sarah Kamau submitted Missions Dept Budget — KES 340,000", type: "approval", read: false, link: "/budgets/bud-missions-q2" },
      { id: "notif-2", userId: users[0].id, title: "Disbursement request pending", message: "Youth camp transport — KES 95,000 awaits your approval",   type: "approval", read: false, link: "/approvals" },
      { id: "notif-3", userId: users[0].id, title: "Expenditure report uploaded",  message: "Outreach Q2 — 4 receipts attached by Peter Odhiambo",      type: "info",     read: true  },
      { id: "notif-4", userId: users[0].id, title: "7 reports outstanding",        message: "Accountability reports overdue for 3 departments.",         type: "warning",  read: true  },
    ];
    for (const notif of notifData) {
      await prisma.notification.upsert({
        where: { id: notif.id },
        update: {},
        create: { ...notif, organizationId: org.id, createdAt: new Date(Date.now() - notifData.indexOf(notif) * 7200000) },
      });
    }
    console.log("✓  Notifications created");

    console.log("\n✅  Seed complete.");
    console.log("\n📋  Login credentials:");
    console.log("    Super user:  admin@steward.app / password123");
    console.log("    Finance:     james@gracecommunity.org / password123");
    console.log("    Chairperson: chair@gracecommunity.org / password123");
    console.log("    Dept Head:   sarah@gracecommunity.org / password123");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("\n❌  Seed failed:", e.message ?? e);
  process.exit(1);
});
