"use client";

import { Search } from "lucide-react";

export type OrderFilter =
  | "ALL"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERY"
  | "COMPLETED";

interface OrderFiltersProps {
  filter: OrderFilter;
  search: string;
  onFilterChange: (filter: OrderFilter) => void;
  onSearchChange: (value: string) => void;
}

const FILTERS: { label: string; value: OrderFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
  { label: "Delivery", value: "DELIVERY" },
  { label: "Completed", value: "COMPLETED" },
];

export function OrderFilters({
  filter,
  search,
  onFilterChange,
  onSearchChange,
}: OrderFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search order ID..."
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onFilterChange(item.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === item.value
                ? "bg-zinc-950 text-white"
                : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}