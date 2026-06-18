import { requireOrgSession } from "@/lib/auth/session";
import { SplashClient } from "./splash-client";

function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const ORG_COLORS = ["#1F4B99", "#15803D", "#7C3AED", "#B45309", "#0F766E"];
function orgColor(name: string) {
  let n = 0;
  for (const c of name) n += c.charCodeAt(0);
  return ORG_COLORS[n % ORG_COLORS.length];
}

export default async function SplashPage(props: { searchParams?: Promise<{ redirect?: string }> }) {
  const session = await requireOrgSession();
  const searchParams = await props.searchParams;

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
