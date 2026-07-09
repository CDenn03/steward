import Link from "next/link";
import { getOrganizationOverviews } from "@/features/admin/repositories";
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { OnboardOrgButton } from '../../../../features/admin/components/organisations/OnboardOrgButton';


export default async function PlatformOrgsPage() {
  const organizations = await getOrganizationOverviews();

  return (
    <>
      <PageHeader title="Organisations" subtitle="All organisations on this Steward instance">
        <OnboardOrgButton />
      </PageHeader>

      <div className="grid grid-cols-2 gap-4">
        {organizations.map((org) => (
          <Link key={org.id} href={`/platform-admin/organisations/${org.id}`} className="block no-underline">
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white font-bold text-[14px] shrink-0"
                    style={{ background: org.primaryColor }}
                  >
                    {org.logoInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold truncate">{org.name}</p>
                    <p className="text-[11px] text-(--muted)">{org.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Members", value: org.members.length },
                    { label: "Departments", value: org.departmentCount },
                    { label: "Budgets", value: org.budgetCount },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-(--bg) rounded-lg px-2 py-2">
                      <p className="text-[11px] text-(--muted) mb-0.5">{label}</p>
                      <p className="text-[13px] font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
