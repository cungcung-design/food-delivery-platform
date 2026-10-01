"use client";

import { SlidersHorizontal } from "lucide-react";

export function RestaurantFilters() {
  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue="recommended"
        className="
          h-10 rounded-xl
          border border-zinc-200
          bg-white px-3
          text-sm font-medium
          outline-none
        "
      >
        <option value="recommended">
          Recommended
        </option>

        <option value="rating">
          Top rated
        </option>

        <option value="delivery">
          Fastest delivery
        </option>

        <option value="fee">
          Lowest delivery fee
        </option>
      </select>

      <button
        className="
          flex size-10 items-center
          justify-center rounded-xl
          border border-zinc-200
          bg-white transition
          hover:bg-zinc-50
        "
        aria-label="More filters"
      >
        <SlidersHorizontal className="size-4" />
      </button>
    </div>
  );
}