"use client";

import { LoaderCircle, LockKeyhole } from "lucide-react";

import { formatMoney } from "@/lib/format";

interface CheckoutSummaryProps {
  subtotal: string;
  deliveryFee: string;
  discount: string;
  total: string;
  submitting: boolean;
  disabled: boolean;
  error: string;
  onPlaceOrder: () => void;
}

export function CheckoutSummary({
  subtotal,
  deliveryFee,
  discount,
  total,
  submitting,
  disabled,
  error,
  onPlaceOrder,
}: CheckoutSummaryProps) {
  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold">Payment summary</h2>

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

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-5 text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={disabled || submitting}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting && (
          <LoaderCircle className="size-4 animate-spin" />
        )}
        {submitting ? "Placing order" : "Place order"}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
        <LockKeyhole className="size-3.5" />
        Secure checkout
      </div>
    </aside>
  );
}
