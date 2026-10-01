interface DeliveryStatusBadgeProps {
  status: string;
}

const CONFIG: Record<string, { label: string; className: string }> = {
  ASSIGNED: { label: "Go to pickup", className: "bg-indigo-50 text-indigo-700" },
  PICKED_UP: { label: "Picked up", className: "bg-cyan-50 text-cyan-700" },
  OUT_FOR_DELIVERY: {
    label: "Delivering",
    className: "bg-orange-50 text-orange-700",
  },
  UNASSIGNED: {
    label: "Available",
    className: "bg-zinc-100 text-zinc-600",
  },
};

export function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  const item = CONFIG[status] ?? {
    label: status,
    className: "bg-zinc-100 text-zinc-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${item.className}`}
    >
      {item.label}
    </span>
  );
}