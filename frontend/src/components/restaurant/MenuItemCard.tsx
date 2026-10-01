"use client";

import { LoaderCircle, Plus } from "lucide-react";

import { formatMoney } from "@/lib/format";

interface MenuItemCardProps {
  name: string;
  description: string;
  price: string;
  available?: boolean;
  busy?: boolean;
  onAdd: () => void;
}

export function MenuItemCard({
  name,
  description,
  price,
  available = true,
  busy = false,
  onAdd,
}: MenuItemCardProps) {
  return (
    <article
      className={`flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition ${
        available ? "hover:shadow-md" : "opacity-60"
      }`}
    >
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-zinc-950">{name}</h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
          {description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold">{formatMoney(price)}</span>

          {!available && (
            <span className="text-xs font-semibold text-zinc-500">
              Unavailable
            </span>
          )}
        </div>
      </div>

      <div className="relative size-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:size-32">
        {available && (
          <button
            type="button"
            onClick={onAdd}
            disabled={busy}
            className="absolute bottom-2 right-2 flex size-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition hover:bg-orange-600 disabled:opacity-50"
            aria-label={`Add ${name} to cart`}
          >
            {busy ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <Plus className="size-5" />
            )}
          </button>
        )}
      </div>
    </article>
  );
}
