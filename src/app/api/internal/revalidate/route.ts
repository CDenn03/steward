import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const VALID_TAGS = ["dashboard", "analytics", "budgets", "income", "expenditures"];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tag } = await req.json();
  if (!VALID_TAGS.includes(tag)) {
    return NextResponse.json({ error: "Invalid tag" }, { status: 400 });
  }

  // Revalidate the relevant paths for this tag
  const pathMap: Record<string, string[]> = {
    dashboard: ["/dashboard"],
    analytics: ["/analytics"],
    budgets: ["/budgets", "/approvals"],
    income: ["/income", "/accounts"],
    expenditures: ["/expenditures"],
  };

  for (const path of pathMap[tag] ?? []) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, tag });
}
