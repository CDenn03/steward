interface OrgStatsCardsProps {
  memberCount: number;
  departmentCount: number;
  inviteCount: number;
  activeMemberCount: number;
}

export function OrgStatsCards({
  memberCount,
  departmentCount,
  inviteCount,
  activeMemberCount,
}: OrgStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
      <StatCard label="Members" value={memberCount} />
      <StatCard label="Departments" value={departmentCount} />
      <StatCard label="Pending invites" value={inviteCount} />
      <StatCard label="Active members" value={activeMemberCount} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-(--border) rounded-2xl px-5 py-4.5">
      <p className="text-[11px] font-semibold text-(--muted) uppercase tracking-wider mb-2">{label}</p>
      <p className="font-display text-[30px] font-semibold text-ink leading-none">{value}</p>
    </div>
  );
}
