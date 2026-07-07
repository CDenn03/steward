/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireSession } from "@/lib/auth/session";
import { getAuditFilterOptions } from "@/features/audit/services";
import { getAuditLogsByOrg } from "@/features/finance/repositories";
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { AuditClient } from './AuditClient';

const ACTIONS = ["submitted", "approved", "rejected", "needs_changes", "created", "updated", "uploaded", "recorded", "allocated"];

export default async function AuditPage(props: { searchParams?: Promise<Record<string, string>> }) {
  const session = await requireSession();
  const searchParams = (await props.searchParams) ?? {};

  const entityType = searchParams.entityType || "";
  const actorId = searchParams.actorId || "";
  const action = searchParams.action || "";

  const [logs, filterOptions] = await Promise.all([
    getAuditLogsByOrg(session.organizationId, 200),
    getAuditFilterOptions(session.organizationId),
  ]);

  let filtered: any[] = logs as any[];
  if (entityType) filtered = filtered.filter((l: any) => l.entityType === entityType);
  if (actorId) filtered = filtered.filter((l: any) => l.actorId === actorId);
  if (action) filtered = filtered.filter((l: any) => l.action === action);

  return (
    <>
      <PageHeader title="Audit Log" subtitle="Immutable record of all financial actions and state changes" />
      <Card>
        <AuditClient
          data={filtered as import("./AuditTable").AuditRow[]}
          entityTypes={filterOptions.entityTypes}
          actors={filterOptions.actors}
          actions={ACTIONS}
          selectedEntityType={entityType}
          selectedActorId={actorId}
          selectedAction={action}
        />
      </Card>
    </>
  );
}
