"use client";

import { useRouter } from "next/navigation";
import { AuditTable, type AuditRow } from './AuditTable';

type ActorOpt = { id: string; name: string };

export function AuditClient({
  data,
  entityTypes,
  actors,
  actions,
  selectedEntityType,
  selectedActorId,
  selectedAction,
}: Readonly<{
  data: AuditRow[];
  entityTypes: string[];
  actors: ActorOpt[];
  actions: string[];
  selectedEntityType: string;
  selectedActorId: string;
  selectedAction: string;
}>) {
  const router = useRouter();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (value) params.set(key, value);
    if (key !== "entityType" && selectedEntityType) params.set("entityType", selectedEntityType);
    if (key !== "actorId" && selectedActorId) params.set("actorId", selectedActorId);
    if (key !== "action" && selectedAction) params.set("action", selectedAction);
    router.push(`/audit${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div>
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-(--border)">
        <select
          value={selectedEntityType}
          onChange={(e) => updateFilter("entityType", e.target.value)}
          className="px-2.5 py-1.5 text-[12px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors"
        >
          <option value="">All entities</option>
          {entityTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={selectedActorId}
          onChange={(e) => updateFilter("actorId", e.target.value)}
          className="px-2.5 py-1.5 text-[12px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors"
        >
          <option value="">All actors</option>
          {actors.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        <select
          value={selectedAction}
          onChange={(e) => updateFilter("action", e.target.value)}
          className="px-2.5 py-1.5 text-[12px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors"
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>{a.replace("_", " ")}</option>
          ))}
        </select>

        {(selectedEntityType || selectedActorId || selectedAction) && (
          <button
            onClick={() => router.push("/audit")}
            className="text-[11px] text-(--muted) hover:text-(--text) underline-offset-2 hover:underline transition-colors ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>
      <AuditTable data={data} />
    </div>
  );
}
