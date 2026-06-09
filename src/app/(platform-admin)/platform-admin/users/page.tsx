import { PageHeader } from "@/components/shared/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockAllUsers } from "@/lib/mock/data";

const roleLabels: Record<string, string> = {
  platform_admin: "Platform Admin",
  admin: "Admin",
  chairperson: "Chairperson",
  finance: "Finance",
  department_head: "Dept Head",
  member: "Member",
};

export default function PlatformUsersPage() {
  return (
    <>
      <PageHeader title="All Users" subtitle={`${mockAllUsers.length} users across all organisations`} />

      <Card>
        <CardBody className="p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["User", "Email", "Organisations & Roles"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.6px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockAllUsers.map((user) => (
                <tr key={user.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold text-[var(--primary)] flex-shrink-0">
                        {user.initials}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[var(--muted)]">{user.email}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {user.memberships.map((m) => (
                        <span key={m.id} className="inline-flex items-center gap-1 text-[11px] bg-[var(--bg)] border border-[var(--border)] rounded-full px-2 py-0.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: m.org.primaryColor }}
                          />
                          {m.org.logoInitials} · {roleLabels[m.role] ?? m.role}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </>
  );
}
