"use client";
import { Plus, Calendar } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { mockEvents, mockBudgets } from "@/lib/mock/data";

export default function EventsPage() {
  return (
    <>
      <PageHeader title="Events" subtitle="Manage recurring and one-time events with budget templates">
        <Button variant="ghost" size="sm"><Calendar size={13} /> Templates</Button>
        <Button size="sm"><Plus size={13} /> New Event</Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4">
        {mockEvents.map((ev) => {
          const budget = mockBudgets.find((b) => b.departmentId === ev.departmentId);
          return (
            <Card key={ev.id} className="hover:shadow-card-hover transition-shadow cursor-pointer">
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-xl">📅</div>
                  <StatusBadge status={budget?.status ?? "draft"} />
                </div>
                <h3 className="text-[15px] font-medium mb-1">{ev.name}</h3>
                <p className="text-[12px] text-[var(--muted)] mb-4">
                  {ev.department?.name ?? "No department"} · {formatDate(ev.startDate)}
                  {ev.endDate ? ` – ${formatDate(ev.endDate)}` : ""}
                </p>
                <div className="border-t border-[var(--border)] pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-[var(--muted)] mb-0.5">Budget</p>
                    <p className="text-[13px] font-mono font-medium">
                      {budget ? formatCurrency(budget.totalAmount) : "Not started"}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">Manage</Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
}
