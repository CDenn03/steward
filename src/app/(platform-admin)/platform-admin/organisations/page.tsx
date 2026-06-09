"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { mockOrgs, mockMemberships, mockAccounts, mockBudgets, mockDepartments } from "@/lib/mock/data";

export default function PlatformOrgsPage() {
  const [showNew, setShowNew] = useState(false);

  return (
    <>
      <PageHeader title="Organisations" subtitle="All organisations on this Steward instance">
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus size={13} /> Onboard Organisation
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4">
        {mockOrgs.map((org) => {
          const members    = mockMemberships.filter((m) => m.organizationId === org.id);
          const accounts   = mockAccounts.filter((a) => a.organizationId === org.id);
          const budgets    = mockBudgets.filter((b) => b.organizationId === org.id);
          const departments = mockDepartments.filter((d) => d.organizationId === org.id);
          const totalLiq   = accounts.reduce((s, a) => s + a.balance, 0);

          return (
            <Card key={org.id}>
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0"
                    style={{ background: org.primaryColor }}
                  >
                    {org.logoInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold truncate">{org.name}</p>
                    <p className="text-[11px] text-[var(--muted)]">{org.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                  {[
                    { label: "Members",     value: members.length },
                    { label: "Departments", value: departments.length },
                    { label: "Budgets",     value: budgets.length },
                    { label: "Liquidity",   value: formatCurrency(totalLiq, org.currency) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[var(--bg)] rounded-[8px] px-2 py-2">
                      <p className="text-[11px] text-[var(--muted)] mb-0.5">{label}</p>
                      <p className="text-[13px] font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="w-[400px]">
            <CardBody>
              <h2 className="text-[14px] font-semibold mb-4">Onboard Organisation</h2>
              <p className="text-[13px] text-[var(--muted)] mb-6">
                Organisation onboarding form — available once Auth.js and DB are configured.
              </p>
              <Button size="sm" variant="outline" onClick={() => setShowNew(false)}>Close</Button>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}
