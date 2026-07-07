import { cookies } from "next/headers";
import { requireOrgSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { SplashClient } from './SplashClient';

function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const ORG_COLORS = ["#1F4B99", "#15803D", "#7C3AED", "#B45309", "#0F766E"];
function orgColor(name: string) {
  let n = 0;
  for (const c of name) n += c.charCodeAt(0);
  return ORG_COLORS[n % ORG_COLORS.length];
}

export default async function SplashPage(props: {
  params: Promise<{ orgId: string }>;
  searchParams?: Promise<{ redirect?: string }>;
}) {
  const { orgId } = await props.params;
  const searchParams = await props.searchParams;

  // Resolve slug from orgId and set cookie so requireOrgSession picks the right org
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { slug: true } });
  let slug = org?.slug;
  if (!slug) {
    // Fallback: try cookie or find any membership
    try { slug = (await cookies()).get("org_slug")?.value; } catch { /* ignore */ }
  }
  if (slug) {
    try { (await cookies()).set("org_slug", slug, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production" }); } catch { /* ignore */ }
  }

  const session = await requireOrgSession(slug);

  return (
    <SplashClient
      orgName={session.organization.name}
      orgColor={orgColor(session.organization.name)}
      orgInitials={initials(session.organization.name)}
      userName={session.user.name}
      role={session.role}
      redirectTo={searchParams?.redirect}
    />
  );
}
