"use client";

import { UtensilsCrossed } from "lucide-react";

import type { MenuItem } from "@/services/menu";

interface MenuItemCardProps {
  item: MenuItem;
  categoryName: string | undefined;
  isUpdating: boolean;
  onToggleAvailability: (item: MenuItem) => void;
}

function formatPrice(price: string): string {
  const parsed = Number.parseFloat(price);

  if (!Number.isFinite(parsed)) {
    return price;
  }

  return `$${parsed.toFixed(2)}`;
}

export function MenuItemCard({
  item,
  categoryName,
  isUpdating,
  onToggleAvailability,
}: MenuItemCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white">
      <div className="flex h-40 items-center justify-center overflow-hidden rounded-t-2xl bg-zinc-100">
        {item.image_url ? (
          // Item images are owner-supplied URLs, so the browser must fetch
          // them directly; the app origin is not a valid image host here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="size-full object-cover"
          />
        ) : (
          <UtensilsCrossed className="size-8 text-zinc-400" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold">{item.name}</h3>

          <span className="shrink-0 font-bold text-orange-600">
            {formatPrice(item.price)}
          </span>
        </div>

        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
            {item.description}
          </p>
        )}

        <div className="mt-3">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
            {categoryName ?? "Uncategorised"}
          </span>
        </div>

        <label className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
          <span className="text-sm font-medium">Available</span>

          <input
            type="checkbox"
            checked={item.is_available}
            disabled={isUpdating}
            onChange={() => onToggleAvailability(item)}
            className="size-5 accent-orange-500"
          />
        </label>
      </div>
    </article>
  );
}