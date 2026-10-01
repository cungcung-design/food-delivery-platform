import type { OrderItem } from "@/services/orders";
import { formatMoney } from "@/lib/format";

interface OrderItemsProps {
  items: OrderItem[];
}

/**
 * Renders the stored order line items. Name and price come from the
 * snapshots taken at checkout, not from current menu prices.
 */
export function OrderItems({ items }: OrderItemsProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold">Your order</h2>

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
                Qty {item.quantity} • {formatMoney(item.price)} each
              </p>
            </div>

            <span className="font-semibold">
              {formatMoney(item.subtotal)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
