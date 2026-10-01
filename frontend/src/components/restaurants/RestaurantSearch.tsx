"use client";

import { Search } from "lucide-react";

export function RestaurantSearch() {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />

      <input
        type="search"
        placeholder="Search restaurants or food..."
        className="
          h-12 w-full rounded-xl
          border border-zinc-200
          bg-white pl-12 pr-4
          text-sm outline-none
          transition
          placeholder:text-zinc-400
          focus:border-orange-400
          focus:ring-2
          focus:ring-orange-100
        "
      />
    </div>
  );
}