"use client";

import { LoaderCircle, Minus, Plus, Trash2 } from "lucide-react";

import type { CartItem as CartItemType } from "@/services/cart";
import { formatMoney } from "@/lib/format";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  busy: boolean;
}

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
  busy,
}: CartItemProps) {
  return (
    <div className="flex gap-4 border-b border-zinc-100 py-5 last:border-none">
      <div className="size-20 shrink-0 rounded-xl bg-zinc-100 sm:size-24" />

      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-zinc-950">{item.name}</h3>

            <p className="mt-1 text-sm font-semibold text-zinc-700">
              {formatMoney(item.price)}
            </p>

            {!item.is_available && (
              <p className="mt-1 text-sm font-medium text-red-600">
                Currently unavailable
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={busy}
            aria-label={`Remove ${item.name}`}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center rounded-xl border border-zinc-200">
            <button
              type="button"
              onClick={() =>
                onQuantityChange(item.id, item.quantity - 1)
              }
              disabled={busy || item.quantity <= 1}
              aria-label={`Decrease ${item.name} quantity`}
              className="flex size-9 items-center justify-center transition hover:bg-zinc-50 disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>

            <span className="min-w-9 text-center text-sm font-semibold">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                onQuantityChange(item.id, item.quantity + 1)
              }
              disabled={busy}
              aria-label={`Increase ${item.name} quantity`}
              className="flex size-9 items-center justify-center transition hover:bg-zinc-50 disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <span className="flex items-center gap-2 font-bold">
            {busy && (
              <LoaderCircle className="size-4 animate-spin text-zinc-400" />
            )}
            {formatMoney(item.line_total)}
          </span>
        </div>
      </div>
    </div>
  );
}
