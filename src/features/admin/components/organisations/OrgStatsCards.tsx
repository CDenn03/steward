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
    <div className="bg-(--surface) rounded-(--r-card) p-4">
      <p className="text-[13px] text-(--muted) m-0 mb-1">{label}</p>
      <p className="text-[24px] font-medium m-0">{value}</p>
    </div>
  );
}
