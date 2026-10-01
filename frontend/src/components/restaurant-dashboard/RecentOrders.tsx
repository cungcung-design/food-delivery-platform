"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import type { Order } from "@/services/orders";
import { formatMoney, formatTimeAgo } from "@/lib/format";

export function RecentOrders({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-100 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold">Recent orders</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Latest orders for your restaurant.
          </p>
        </div>

        <Link
          href="/restaurant/orders"
          className="text-sm font-semibold text-orange-600"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-zinc-100">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/restaurant/orders/${order.id}`}
            className="flex items-center gap-4 p-4 transition hover:bg-zinc-50 sm:p-5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-bold">#{order.id.slice(0, 8)}</p>

                <OrderStatusBadge status={order.status} />
              </div>

              <p className="mt-1 text-sm text-zinc-500">
                {formatTimeAgo(order.created_at)}
              </p>
            </div>

            <p className="shrink-0 font-bold">
              {formatMoney(order.total)}
            </p>

            <ChevronRight className="size-5 shrink-0 text-zinc-400" />
          </Link>
        ))}
      </div>
    </section>
  );
}