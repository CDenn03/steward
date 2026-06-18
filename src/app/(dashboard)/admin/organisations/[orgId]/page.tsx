import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { getOrganizationOverviews } from "@/features/admin/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { OrgSettingsForm } from "./org-settings-form";

export default async function OrgSettingsPage(props: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await props.params;
  const orgs = await getOrganizationOverviews();
  const org = orgs.find((o) => o.id === orgId);

  if (!org) return <div className="p-7 text-[13px] text-(--muted)">Organisation not found</div>;

  return (
    <>
      <PageHeader
        title={org.name}
        subtitle={`/${org.slug} · ${org.currency}`}
      >
        <Link href="/admin/organisations">
          <Button variant="ghost" size="sm"><ArrowLeft size={13} /> Back</Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle><p className="text-[14px] font-medium">Organisation Details</p></CardTitle>
            </CardHeader>
            <OrgSettingsForm org={org} />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle><p className="text-[14px] font-medium">Overview</p></CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-(--muted)">Members</span>
                <span className="font-medium">{org.members.length}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-(--muted)">Departments</span>
                <span className="font-medium">{org.departmentCount}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-(--muted)">Budgets</span>
                <span className="font-medium">{org.budgetCount}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-(--muted)">Approved Budgets</span>
                <span className="font-medium">{org.approvedBudgetCount}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-(--muted)">Liquid Assets</span>
                <span className="font-medium">{formatCurrency(org.totalLiquidity, org.currency, true)}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
