import Link from "next/link";
import { BellRing } from "lucide-react";

import type { Order } from "@/services/orders";
import { formatMoney, formatTimeAgo } from "@/lib/format";

/**
 * Points the owner at the incoming queue. The order is never accepted or
 * rejected from this summary; that decision lives on the incoming page.
 */
export function IncomingOrderAlert({ order }: { order?: Order }) {
  if (!order) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-orange-200 bg-orange-50 p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
          <BellRing className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold">New order received</h2>

            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-orange-700">
              Action required
            </span>
          </div>

          <p className="mt-1 text-sm text-zinc-600">
            Order #{order.id.slice(0, 8)} •{" "}
            {formatMoney(order.total)}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            Received {formatTimeAgo(order.created_at)}
          </p>
        </div>

        <Link
          href="/restaurant/orders/incoming"
          className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Review order
        </Link>
      </div>
    </section>
  );
}