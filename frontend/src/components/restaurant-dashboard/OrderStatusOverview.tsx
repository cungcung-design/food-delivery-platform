import { orderStatusStyle } from "@/lib/order-status";

const SEGMENT_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500",
  CONFIRMED: "bg-blue-500",
  PREPARING: "bg-orange-500",
  READY: "bg-purple-500",
  DRIVER_ASSIGNED: "bg-indigo-500",
  PICKED_UP: "bg-cyan-500",
  OUT_FOR_DELIVERY: "bg-cyan-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-zinc-400",
  REJECTED: "bg-red-500",
};

function segmentStyle(status: string): string {
  return SEGMENT_STYLES[status] ?? orderStatusStyle(status).split(" ")[0];
}

export function OrderStatusOverview({
  statusCounts,
}: {
  statusCounts: { status: string; count: number }[];
}) {
  const total = statusCounts.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  if (total === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold">Order overview</h2>

      <p className="mt-1 text-sm text-zinc-500">
        All orders by current status.
      </p>

      <div className="mt-6 flex h-2 overflow-hidden rounded-full bg-zinc-100">
        {statusCounts.map((item) => (
          <div
            key={item.status}
            className={segmentStyle(item.status)}
            style={{ width: `${(item.count / total) * 100}%` }}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5">
        {statusCounts.map((item) => (
          <div key={item.status}>
            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 shrink-0 rounded-full ${segmentStyle(item.status)}`}
              />

              <span className="truncate text-xs text-zinc-500">
                {item.status}
              </span>
            </div>

            <p className="mt-2 text-xl font-bold">{item.count}</p>
          </div>
        ))}
      </div>
    </section>
  );
}