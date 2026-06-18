/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, isActive: true },
    include: { organization: true },
  });
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const year = Number.parseInt(searchParams.get("year") ?? "") || new Date().getFullYear();

  const records: any[] = await prisma.income.findMany({
    where: {
      organizationId: membership.organizationId,
      receivedAt: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) },
    },
    include: { account: true, department: true, event: true },
    orderBy: { receivedAt: "desc" },
    take: 1000,
  });

  const header = "Date,Description,Category,Amount,Account,Department,Event,Recorded By";
  const rows = records.map((r: any) => {
    const date = r.receivedAt.toISOString().split("T")[0];
    const account = r.account?.name ?? "";
    const dept = r.department?.name ?? "";
    const event = r.event?.name ?? "";
    return `"${date}","${r.description}","${r.category}",${r.amount},"${account}","${dept}","${event}","${r.recordedById}"`;
  });

  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="income-${year}.csv"`,
    },
  });
}
