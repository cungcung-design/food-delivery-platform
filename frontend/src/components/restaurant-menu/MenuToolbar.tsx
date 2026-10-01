"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";

import type { MenuCategory } from "@/services/menu";

export const ALL_CATEGORIES = "all";

interface MenuToolbarProps {
  search: string;
  categoryId: string;
  categories: MenuCategory[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

/**
 * Categories come from the owner's own menu response, so the filter can
 * never list a category the owner does not actually have.
 */
export function MenuToolbar({
  search,
  categoryId,
  categories,
  onSearchChange,
  onCategoryChange,
}: MenuToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search menu..."
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <select
          value={categoryId}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        >
          <option value={ALL_CATEGORIES}>All categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <Link
        href="/restaurant/menu/new"
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        <Plus className="size-4" />
        Add menu item
      </Link>
    </div>
  );
}