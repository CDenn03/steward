"use client";

import { useState } from "react";
import { Plus, Users, DollarSign, Building2, Settings } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { mockOrgs, mockMemberships, mockAccounts, mockBudgets } from "@/lib/mock/data";

export default function AdminOrgsPage() {
  const [showNew, setShowNew] = useState(false);

  return (
    <>
      <PageHeader
        title="Organisations"
        subtitle="All organisations on this Steward instance"
      >
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus size={13} /> New Organisation
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4">
        {mockOrgs.map((org) => {
          const members   = mockMemberships.filter((m) => m.organizationId === org.id);
          const accounts  = mockAccounts.filter((a) => a.organizationId === org.id);
          const budgets   = mockBudgets.filter((b) => b.organizationId === org.id);
          const approved  = budgets.filter((b) => b.status === "chair_approved").length;
          const totalLiq  = accounts.reduce((s, a) => s + a.balance, 0);

          return (
            <Card key={org.id} className="hover:shadow-card-hover transition-shadow">
              <CardBody>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-[12px] flex items-center justify-center text-white font-bold text-[16px]"
                      style={{ background: org.primaryColor }}
                    >
                      {org.logoInitials}
                    </div>
                    <div>
                      <h3 className="text-[14px] font-semibold">{org.name}</h3>
                      <p className="text-[12px] text-[var(--muted)]">{org.description}</p>
                      <p className="text-[10px] text-[var(--muted)] font-mono mt-0.5">/{org.slug}</p>
                    </div>
                  </div>
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--bg)] transition-colors">
                    <Settings size={13} />
                  </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {[
                    { icon: Users,       label: "Members",          value: members.length },
                    { icon: DollarSign,  label: "Active Budgets",   value: approved },
                    { icon: Building2,   label: "Liquid Assets",    value: formatCurrency(totalLiq, org.currency, true) },
                  ].map((s) => (
                    <div key={s.label} className="bg-[var(--bg)] border border-[var(--border)] rounded-[10px] px-2.5 py-2">
                      <p className="text-[10px] text-[var(--muted)] mb-1">{s.label}</p>
                      <p className="text-[13px] font-semibold">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Member avatars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center -space-x-1.5">
                    {members.slice(0, 5).map((m, i) => (
                      <div
                        key={m.id}
                        className="w-6 h-6 rounded-full border-2 border-[var(--surface)] flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ background: org.primaryColor, opacity: 0.7 + i * 0.06, zIndex: 5 - i }}
                        title={m.userId}
                      >
                        {m.userId.slice(-1).toUpperCase()}
                      </div>
                    ))}
                    {members.length > 5 && (
                      <div className="w-6 h-6 rounded-full border-2 border-[var(--surface)] bg-[var(--border)] flex items-center justify-center text-[9px] font-medium text-[var(--muted)]">
                        +{members.length - 5}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                      style={{ background: org.primaryColor + "18", color: org.primaryColor }}
                    >
                      {org.currency} · {org.fiscalYearStart}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* New org modal placeholder */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-dialog)] w-full max-w-[420px] shadow-2xl">
            <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">New Organisation</h2>
              <button onClick={() => setShowNew(false)} className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--muted)] hover:bg-[var(--bg)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: "Organisation name", placeholder: "e.g. Hope Foundation Kenya" },
                { label: "Slug / URL", placeholder: "hope-foundation" },
                { label: "Currency", placeholder: "KES" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[12px] font-medium mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors"
                  />
                </div>
              ))}
              <div className="flex gap-2.5 pt-1">
                <Button variant="ghost" className="flex-1 justify-center" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button className="flex-1 justify-center" onClick={() => setShowNew(false)}>Create Organisation</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
