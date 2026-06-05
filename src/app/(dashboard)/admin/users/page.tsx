"use client";

import { useState } from "react";
import { Plus, Search, Mail, Edit2, Trash2, Building2, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { mockAllUsers, mockOrgs, mockDepartments } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  admin: "Admin", chairperson: "Chairperson",
  finance: "Finance", department_head: "Dept Head", member: "Member",
};
const roleVariants: Record<string, "default"|"info"|"success"|"gold"|"warning"|"draft"> = {
  admin: "info", chairperson: "default", finance: "success",
  department_head: "gold", member: "draft",
};

type UserWithMemberships = typeof mockAllUsers[number];
type MembershipEntry = UserWithMemberships["memberships"][number];

// ─── Invite Modal ─────────────────────────────────────────────────────────────
function InviteModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"details" | "orgs">("details");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [assignments, setAssignments] = useState<
    { orgId: string; role: string; deptId: string }[]
  >([{ orgId: "", role: "member", deptId: "" }]);

  const addAssignment = () =>
    setAssignments((a) => [...a, { orgId: "", role: "member", deptId: "" }]);

  const updateAssignment = (i: number, field: string, value: string) =>
    setAssignments((a) => a.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)));

  const removeAssignment = (i: number) =>
    setAssignments((a) => a.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-dialog)] w-full max-w-[520px] shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold">Invite a user</h2>
            <p className="text-[12px] text-[var(--muted)] mt-0.5">
              Assign them to one or more organisations with specific roles
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--muted)] hover:bg-[var(--bg)] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex border-b border-[var(--border)]">
          {["User details", "Organisation roles"].map((label, i) => {
            const s = i === 0 ? "details" : "orgs";
            return (
              <button
                key={label}
                onClick={() => i === 0 || email ? setStep(s as typeof step) : undefined}
                className={cn(
                  "flex-1 py-3 text-[12px] font-medium transition-colors border-b-2",
                  step === s
                    ? "text-[var(--primary)] border-[var(--primary)]"
                    : "text-[var(--muted)] border-transparent hover:text-[var(--text)]"
                )}
              >
                <span className={cn(
                  "inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold mr-1.5",
                  step === s ? "bg-[var(--primary)] text-white" : "bg-[var(--border)] text-[var(--muted)]"
                )}>{i + 1}</span>
                {label}
              </button>
            );
          })}
        </div>

        <div className="px-6 py-5 space-y-4">
          {step === "details" ? (
            <>
              <div>
                <label className="block text-[12px] font-medium mb-1.5">Full name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Kamau"
                  className="w-full px-3 py-2 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5">Email address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@example.org"
                  className="w-full px-3 py-2 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors"
                />
                <p className="text-[11px] text-[var(--muted)] mt-1">
                  If this email already has a Steward account, they will be added directly.
                </p>
              </div>
              <Button
                className="w-full justify-center"
                disabled={!email || !name}
                onClick={() => setStep("orgs")}
              >
                Continue → Assign roles
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {assignments.map((a, i) => {
                  const depts = mockDepartments.filter((d) => d.organizationId === a.orgId);
                  return (
                    <div key={i} className="bg-[var(--bg)] border border-[var(--border)] rounded-[12px] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-medium text-[var(--muted)]">Assignment {i + 1}</p>
                        {assignments.length > 1 && (
                          <button onClick={() => removeAssignment(i)} className="text-[var(--muted)] hover:text-danger transition-colors">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium mb-1 text-[var(--muted)]">Organisation</label>
                        <select
                          value={a.orgId}
                          onChange={(e) => updateAssignment(i, "orgId", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-[12.5px] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] outline-none focus:border-[var(--primary)] text-[var(--text)] transition-colors"
                        >
                          <option value="">Select organisation</option>
                          {mockOrgs.map((o) => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-medium mb-1 text-[var(--muted)]">Role</label>
                          <select
                            value={a.role}
                            onChange={(e) => updateAssignment(i, "role", e.target.value)}
                            className="w-full px-2.5 py-1.5 text-[12.5px] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] outline-none focus:border-[var(--primary)] text-[var(--text)] transition-colors"
                          >
                            <option value="member">Member</option>
                            <option value="department_head">Department Head</option>
                            <option value="finance">Finance Officer</option>
                            <option value="chairperson">Chairperson</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium mb-1 text-[var(--muted)]">Department</label>
                          <select
                            value={a.deptId}
                            onChange={(e) => updateAssignment(i, "deptId", e.target.value)}
                            disabled={!a.orgId || a.role === "admin" || a.role === "finance" || a.role === "chairperson"}
                            className="w-full px-2.5 py-1.5 text-[12.5px] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] outline-none focus:border-[var(--primary)] text-[var(--text)] transition-colors disabled:opacity-40"
                          >
                            <option value="">None</option>
                            {depts.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={addAssignment}
                className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-[var(--border)] rounded-[10px] text-[12px] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-all"
              >
                <Plus size={12} /> Add to another organisation
              </button>
              <div className="flex gap-2.5 pt-1">
                <Button variant="ghost" className="flex-1 justify-center" onClick={() => setStep("details")}>
                  Back
                </Button>
                <Button className="flex-1 justify-center" onClick={onClose}>
                  <Mail size={13} /> Send invitation
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const filtered = mockAllUsers.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}

      <PageHeader
        title="User Management"
        subtitle="Manage all users and their organisation memberships"
      >
        <Button size="sm" onClick={() => setShowInvite(true)}>
          <Plus size={13} /> Invite User
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Users", value: mockAllUsers.length },
          { label: "Organisations", value: mockOrgs.length },
          { label: "Total Memberships", value: mockAllUsers.reduce((s, u) => s + u.memberships.length, 0) },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] px-4 py-3.5">
            <p className="text-[11px] text-[var(--muted)] uppercase tracking-[0.5px] font-medium mb-1">{s.label}</p>
            <p className="text-[22px] font-semibold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-[12px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none w-52 focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors"
          />
        </div>
      </div>

      <Card>
        <div className="divide-y divide-[var(--border)]">
          {filtered.map((user) => {
            const isExpanded = expandedUser === user.id;
            return (
              <div key={user.id}>
                {/* User row */}
                <button
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg)] transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[13px] font-semibold text-[var(--primary)] flex-shrink-0">
                    {user.initials}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium">{user.name}</p>
                    <p className="text-[11px] text-[var(--muted)]">{user.email}</p>
                  </div>

                  {/* Org badges */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {user.memberships.map((m: MembershipEntry) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                        style={{
                          background: m.org.primaryColor + "18",
                          color: m.org.primaryColor,
                        }}
                      >
                        <span>{m.org.logoInitials}</span>
                        <span>· {roleLabels[m.role] ?? m.role}</span>
                      </div>
                    ))}
                  </div>

                  {/* Expand */}
                  <ChevronDown
                    size={14}
                    className={cn("text-[var(--muted)] flex-shrink-0 transition-transform", isExpanded && "rotate-180")}
                  />
                </button>

                {/* Expanded membership details */}
                {isExpanded && (
                  <div className="px-5 pb-4 bg-[var(--bg)] border-t border-[var(--border)]">
                    <div className="pt-4 space-y-2.5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.5px]">
                          Organisation memberships
                        </p>
                        <button className="text-[11px] text-[var(--primary)] hover:underline">
                          + Add to organisation
                        </button>
                      </div>
                      {user.memberships.map((m: MembershipEntry) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-3.5 py-3"
                        >
                          <div
                            className="w-7 h-7 rounded-[7px] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                            style={{ background: m.org.primaryColor }}
                          >
                            {m.org.logoInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium">{m.org.name}</p>
                            <p className="text-[11px] text-[var(--muted)]">
                              {m.department ? `${m.department.name} · ` : ""}
                              {roleLabels[m.role] ?? m.role}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge variant={roleVariants[m.role] ?? "draft"}>
                              {roleLabels[m.role] ?? m.role}
                            </Badge>
                            <button className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors" title="Edit membership">
                              <Edit2 size={11} />
                            </button>
                            <button className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--muted)] hover:text-danger hover:bg-danger-bg transition-colors" title="Remove from org">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
