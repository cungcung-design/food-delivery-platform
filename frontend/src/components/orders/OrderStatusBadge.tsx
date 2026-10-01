import { cn } from "@/lib/utils";
import { orderStatusLabel, orderStatusStyle } from "@/lib/order-status";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
        orderStatusStyle(status),
        className,
      )}
    >
      {orderStatusLabel(status)}
    </span>
  );
}
