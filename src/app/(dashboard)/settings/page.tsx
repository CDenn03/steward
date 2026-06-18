"use client";
import { useOrg } from "@/lib/org/context";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const { active } = useOrg();

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your organisation and account settings" />
      <div className="grid grid-cols-[1.2fr_1fr] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle><p className="text-[14px] font-medium">Organisation</p></CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <Input label="Organisation Name" defaultValue={active?.orgName ?? ""} />
              <Input label="Currency"          defaultValue={active ? "KES" : ""} />
              <Input label="Fiscal Year Start" defaultValue="January 1" />
              <Button size="sm">Save Changes</Button>
            </CardBody>
          </Card>
          <Card>
            <CardHeader><CardTitle><p className="text-[14px] font-medium">Approval Workflow</p></CardTitle></CardHeader>
            <CardBody className="space-y-3">
              {[
                { label: "Finance Review Required",    desc: "Budgets must pass finance review before chair approval" },
                { label: "Two-stage Approval",         desc: "Finance Officer then Chairperson must both approve" },
                { label: "Expenditure Report Required",desc: "Reports must be submitted after each event" },
              ].map((s) => (
                <div key={s.label} className="flex items-start justify-between gap-4 py-2 border-b border-(--border) last:border-0">
                  <div>
                    <p className="text-[13px] font-medium">{s.label}</p>
                    <p className="text-[12px] text-(--muted)">{s.desc}</p>
                  </div>
                  <div className="w-9 h-5 bg-(--primary) rounded-full flex items-center justify-end pr-0.5 shrink-0 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle><p className="text-[14px] font-medium">Your Profile</p></CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[16px] font-semibold text-(--primary)">
                  {active?.userInitials ?? "?"}
                </div>
                <div>
                  <p className="text-[14px] font-medium">{active?.userName ?? "—"}</p>
                  <p className="text-[12px] text-(--muted)">{active?.userEmail ?? "—"}</p>
                </div>
              </div>
              <Input label="Full Name"     defaultValue={active?.userName ?? ""} />
              <Input label="Email"         defaultValue={active?.userEmail ?? ""} type="email" />
              <Button size="sm">Update Profile</Button>
            </CardBody>
          </Card>
          <Card>
            <CardHeader><CardTitle><p className="text-[14px] font-medium">Notifications</p></CardTitle></CardHeader>
            <CardBody className="space-y-3">
              {["Budget submitted for review","Approval decisions","Outstanding reports reminder","Account balance alerts"].map((label) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-(--border) last:border-0">
                  <p className="text-[13px]">{label}</p>
                  <div className="w-9 h-5 bg-(--primary) rounded-full flex items-center justify-end pr-0.5 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
