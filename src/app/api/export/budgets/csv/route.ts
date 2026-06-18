/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, isActive: true },
    include: { organization: true },
  });
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const budgets: any[] = await prisma.budget.findMany({
    where: { organizationId: membership.organizationId },
    include: { department: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const header = "Title,Department,Status,Period Start,Period End,Items,Total Amount,Created";
  const rows = budgets.map((b: any) => {
    const dept = b.department?.name ?? "";
    const itemCount = b.items.length;
    const total = b.items.reduce((s: number, i: any) => s + i.totalCost, 0);
    const start = b.periodStart?.toISOString().split("T")[0] ?? "";
    const end = b.periodEnd?.toISOString().split("T")[0] ?? "";
    const created = b.createdAt.toISOString().split("T")[0];
    return `"${b.title}","${dept}","${b.status}","${start}","${end}",${itemCount},${total},"${created}"`;
  });

  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="budgets-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
