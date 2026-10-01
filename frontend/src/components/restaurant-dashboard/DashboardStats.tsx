import { formatMoney } from "@/lib/format";

export interface DashboardStats {
  todayRevenue: number;
  todayOrderCount: number;
  activeOrderCount: number;
  averageOrderValue: number;
}

/**
 * Every figure is derived from the owner's own order list. The backend
 * exposes no aggregate endpoint for restaurants, so these totals are
 * computed in the browser from ownership-scoped data only.
 */
export function DashboardStats({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: "Today's revenue",
      value: formatMoney(stats.todayRevenue),
      description: "Today's non-cancelled orders",
    },
    {
      label: "Today's orders",
      value: String(stats.todayOrderCount),
      description: "All orders received today",
    },
    {
      label: "Active orders",
      value: String(stats.activeOrderCount),
      description: "Currently in progress",
    },
    {
      label: "Avg. order value",
      value: formatMoney(stats.averageOrderValue),
      description: "Today's average",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-zinc-200 bg-white p-5"
        >
          <p className="text-sm font-medium text-zinc-500">
            {card.label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight">
            {card.value}
          </p>

          <p className="mt-4 text-xs text-zinc-400">
            {card.description}
          </p>
        </article>
      ))}
    </div>
  );
}