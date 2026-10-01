"use client";

import { useMemo } from "react";

import { EmptyMenu } from "@/components/restaurant-menu/EmptyMenu";
import { MenuItemCard } from "@/components/restaurant-menu/MenuItemCard";
import type { MenuCategory, MenuItem } from "@/services/menu";

interface MenuItemsGridProps {
  items: MenuItem[];
  categories: MenuCategory[];
  search: string;
  categoryId: string;
  allCategoriesValue: string;
  updatingId: string | null;
  onToggleAvailability: (item: MenuItem) => void;
}

export function MenuItemsGrid({
  items,
  categories,
  search,
  categoryId,
  allCategoriesValue,
  updatingId,
  onToggleAvailability,
}: MenuItemsGridProps) {
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((item) => {
      if (categoryId !== allCategoriesValue && item.category_id !== categoryId) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        item.name.toLowerCase().includes(term) ||
        (item.description ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, categoryId, allCategoriesValue, search]);

  if (visibleItems.length === 0) {
    return <EmptyMenu />;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {visibleItems.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          categoryName={
            item.category_id
              ? categoryNames.get(item.category_id)
              : undefined
          }
          isUpdating={updatingId === item.id}
          onToggleAvailability={onToggleAvailability}
        />
      ))}
    </div>
  );
}