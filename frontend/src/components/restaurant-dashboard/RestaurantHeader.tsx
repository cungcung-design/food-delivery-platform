"use client";

import { Menu, Store } from "lucide-react";

import type { Restaurant } from "@/services/restaurants";

const STATUS_STYLES: Record<
  Restaurant["status"],
  { dot: string; label: string }
> = {
  OPEN: { dot: "bg-green-500", label: "Open" },
  CLOSED: { dot: "bg-red-500", label: "Closed" },
  SUSPENDED: { dot: "bg-zinc-400", label: "Suspended" },
};

interface RestaurantHeaderProps {
  onMenuOpen: () => void;
  restaurant?: Restaurant;
}

export function RestaurantHeader({
  onMenuOpen,
  restaurant,
}: RestaurantHeaderProps) {
  const status = restaurant ? STATUS_STYLES[restaurant.status] : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:h-20">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open navigation"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-zinc-100 lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold sm:text-base">
            {restaurant?.name ?? "Restaurant"}
          </p>

          <div className="mt-0.5 flex items-center gap-1.5">
            <span
              className={`size-2 shrink-0 rounded-full ${
                status?.dot ?? "bg-zinc-300"
              }`}
            />

            <span className="truncate text-xs text-zinc-500">
              {status?.label ?? "Loading"}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-3 rounded-xl py-2 sm:flex">
        <div className="flex size-9 items-center justify-center rounded-full bg-orange-100">
          <Store className="size-4 text-orange-600" />
        </div>

        <div className="text-left">
          <p className="max-w-40 truncate text-sm font-semibold">
            {restaurant?.name ?? "Owner"}
          </p>

          <p className="text-xs text-zinc-500">Owner</p>
        </div>
      </div>
    </header>
  );
}