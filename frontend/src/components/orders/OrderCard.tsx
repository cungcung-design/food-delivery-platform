import Link from "next/link";
import { ArrowRight, Clock3, ShoppingBag } from "lucide-react";

import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatMoney, formatDateTime } from "@/lib/format";

interface OrderCardProps {
  id: string;
  restaurantName?: string;
  status: string;
  itemCount?: number;
  total: string;
  createdAt: string;
}

export function OrderCard({
  id,
  restaurantName,
  status,
  itemCount,
  total,
  createdAt,
}: OrderCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <ShoppingBag className="size-5 text-orange-500" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-bold">
              {restaurantName ?? "Restaurant"}
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Order #{id.slice(0, 8)}
            </p>
          </div>
        </div>

        <OrderStatusBadge status={status} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500">
        {typeof itemCount === "number" && (
          <span>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <Clock3 className="size-4" />
          {formatDateTime(createdAt)}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
        <div>
          <p className="text-xs text-zinc-500">Total</p>

          <p className="font-bold">{formatMoney(total)}</p>
        </div>

        <Link
          href={`/orders/${id}`}
          className="flex items-center gap-1 text-sm font-semibold text-orange-600"
        >
          View order
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
