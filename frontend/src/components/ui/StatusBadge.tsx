const STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PREPARING: "bg-orange-50 text-orange-700",
  READY: "bg-purple-50 text-purple-700",
  DRIVER_ASSIGNED: "bg-indigo-50 text-indigo-700",
  ASSIGNED: "bg-indigo-50 text-indigo-700",
  PICKED_UP: "bg-cyan-50 text-cyan-700",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-zinc-100 text-zinc-600",
  UNASSIGNED: "bg-zinc-100 text-zinc-600",
  REJECTED: "bg-red-50 text-red-700",
  AVAILABLE: "bg-green-50 text-green-700",
  BUSY: "bg-orange-50 text-orange-700",
  OFFLINE: "bg-zinc-100 text-zinc-600",
  PAUSED: "bg-amber-50 text-amber-700",
  OPEN: "bg-green-50 text-green-700",
  CLOSED: "bg-zinc-100 text-zinc-600",
  SUSPENDED: "bg-red-50 text-red-700",
};

const LABELS: Record<string, string> = {
  ASSIGNED: "Driver assigned",
  UNASSIGNED: "No driver",
  OUT_FOR_DELIVERY: "Out for delivery",
  DRIVER_ASSIGNED: "Driver assigned",
};

/**
 * Status is always shown as text, never as colour alone, so the state is
 * still readable without colour perception.
 */
export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? "bg-zinc-100 text-zinc-600";
  const label = LABELS[status] ?? status.replaceAll("_", " ");

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${style}`}
    >
      {label}
    </span>
  );
}
