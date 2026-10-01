import { AlertTriangle } from "lucide-react";

import type { CartItem } from "@/services/cart";
import { formatMoney } from "@/lib/format";

interface CheckoutItemsProps {
  items: CartItem[];
  restaurantName?: string;
}

export function CheckoutItems({
  items,
  restaurantName,
}: CheckoutItemsProps) {
  const unavailable = items.filter((item) => !item.is_available);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-bold">Order review</h2>

        {restaurantName && (
          <p className="mt-1 text-sm text-zinc-500">{restaurantName}</p>
        )}
      </div>

      {unavailable.length > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />

          <p className="text-sm leading-5 text-amber-900">
            {unavailable.length === 1
              ? `${unavailable[0].name} is no longer available. `
              : `${unavailable.length} items are no longer available. `}
            Remove them from your cart before placing this order.
          </p>
        </div>
      )}

      <div className="mt-5 divide-y divide-zinc-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div className="size-16 shrink-0 rounded-xl bg-zinc-100" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">{item.name}</p>

              <p className="mt-1 text-sm text-zinc-500">
                Qty {item.quantity}
                {item.is_available ? "" : " • unavailable"}
              </p>
            </div>

            <span className="font-semibold">
              {formatMoney(item.line_total)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
