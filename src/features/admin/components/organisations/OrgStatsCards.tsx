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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
      <StatCard label="Members" value={memberCount} />
      <StatCard label="Departments" value={departmentCount} />
      <StatCard label="Pending invites" value={inviteCount} />
      <StatCard label="Active members" value={activeMemberCount} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl p-4 text-center">
      <p className="text-[12px] font-semibold text-warmgray uppercase tracking-wide mb-1.5 m-0">{label}</p>
      <p className="font-display text-2xl font-semibold text-ink m-0">{value}</p>
    </div>
  );
}
