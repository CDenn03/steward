import { Calendar } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getEventsWithBudgets, getBudgetFormOptions } from "@/features/budgets/repositories";
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate, formatCurrency } from "@/lib/utils";
import { NewEventButton } from './NewEventButton';
import type { BudgetStatus } from "@/types";

type EventRow = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  department: { name: string } | null;
  budgets: Array<{ status: string; items: Array<{ totalCost: number }> }>;
};

export default async function EventsPage() {
  const session = await requireSession();
  const [events, formOptions] = await Promise.all([
    getEventsWithBudgets(session.organizationId),
    getBudgetFormOptions(session.organizationId),
  ]);
  const allEvents = events as EventRow[];

  return (
    <>
      <PageHeader title="Events" subtitle="Manage recurring and one-time events with budget templates">
        <Button variant="ghost" size="sm"><Calendar size={13} /> Templates</Button>
        <NewEventButton departments={formOptions.departments} />
      </PageHeader>

      <div className="grid grid-cols-2 gap-4">
        {allEvents.map((event: EventRow) => {
          const budget = event.budgets[0];
          const total = budget?.items.reduce((sum, item) => sum + item.totalCost, 0) ?? 0;
          return (
            <Card key={event.id} className="hover:shadow-card-hover transition-shadow cursor-pointer">
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-(--primary)">
                    <Calendar size={18} />
                  </div>
                  <StatusBadge status={(budget?.status.toLowerCase() ?? "draft") as BudgetStatus} />
                </div>
                <h3 className="text-[16px] font-medium mb-1">{event.name}</h3>
                <p className="text-[13px] text-(--muted) mb-4">
                  {event.department?.name ?? "No department"} · {formatDate(event.startDate)}
                  {event.endDate ? ` - ${formatDate(event.endDate)}` : ""}
                </p>
                <div className="border-t border-(--border) pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-(--muted) mb-0.5">Budget</p>
                    <p className="text-[14px] font-mono font-medium">
                      {budget ? formatCurrency(total, session.organization.currency) : "Not started"}
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
