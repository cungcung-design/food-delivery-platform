import type { Order } from "@/services/orders";
import { formatMoney } from "@/lib/format";

interface OrderPriceSummaryProps {
  order: Order;
}

/**
 * All values are read from the stored order. The browser never recomputes
 * a total for an order that already exists.
 */
export function OrderPriceSummary({ order }: OrderPriceSummaryProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold">Payment summary</h2>

      <div className="mt-5 space-y-4 text-sm">
        <div className="flex justify-between text-zinc-600">
          <span>Subtotal</span>
          <span>{formatMoney(order.subtotal)}</span>
        </div>

        <div className="flex justify-between text-zinc-600">
          <span>Delivery fee</span>
          <span>{formatMoney(order.delivery_fee)}</span>
        </div>

        {Number(order.discount) > 0 && (
          <div className="flex justify-between text-zinc-600">
            <span>Discount</span>
            <span>-{formatMoney(order.discount)}</span>
          </div>
        )}

        <div className="flex justify-between border-t border-zinc-200 pt-4">
          <span className="font-bold text-zinc-950">Total</span>

          <span className="text-lg font-bold">
            {formatMoney(order.total)}
          </span>
        </div>

        <div className="flex justify-between text-xs text-zinc-500">
          <span>Payment</span>
          <span>{order.payment_status}</span>
        </div>
      </div>
    </section>
  );
}
