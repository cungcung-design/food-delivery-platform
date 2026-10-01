import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatMoney } from "@/lib/format";

interface CartSummaryProps {
  subtotal: string;
  deliveryFee: string;
  discount: string;
  total: string;
}

export function CartSummary({
  subtotal,
  deliveryFee,
  discount,
  total,
}: CartSummaryProps) {
  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold">Order summary</h2>

      <div className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between text-zinc-600">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>

        <div className="flex justify-between text-zinc-600">
          <span>Delivery fee</span>
          <span>{formatMoney(deliveryFee)}</span>
        </div>

        {Number(discount) > 0 && (
          <div className="flex justify-between text-zinc-600">
            <span>Discount</span>
            <span>-{formatMoney(discount)}</span>
          </div>
        )}

        <div className="border-t border-zinc-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-bold">Total</span>

            <span className="text-xl font-bold">{formatMoney(total)}</span>
          </div>
        </div>
      </div>

      <Link
        href="/checkout"
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 font-semibold text-white transition hover:bg-orange-600"
      >
        Continue to checkout
        <ArrowRight className="size-4" />
      </Link>

      <Link
        href="/restaurants"
        className="mt-3 flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
      >
        Add more items
      </Link>
    </aside>
  );
}
