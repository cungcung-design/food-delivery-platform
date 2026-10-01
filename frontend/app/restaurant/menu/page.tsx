"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  ALL_CATEGORIES,
  MenuToolbar,
} from "@/components/restaurant-menu/MenuToolbar";
import { MenuItemsGrid } from "@/components/restaurant-menu/MenuItemsGrid";
import { useOwnerMenu } from "@/hooks/useOwnerMenu";
import { setItemAvailability, type MenuItem } from "@/services/menu";

export default function RestaurantMenuPage() {
  const { items, categories, loading, error, reload } = useOwnerMenu();

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(ALL_CATEGORIES);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function handleToggleAvailability(item: MenuItem) {
    setUpdatingId(item.id);
    setActionError("");

    try {
      await setItemAvailability(item.id, !item.is_available);
      await reload();
      toast.success("Menu item updated");
    } catch (toggleError) {
      const message =
        toggleError instanceof Error
          ? toggleError.message
          : "Could not update availability.";
      setActionError(message);
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm font-semibold text-orange-500">Menu</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Menu management
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Add items, organise them into categories, and control what is
          currently orderable.
        </p>
      </div>

      <div className="mt-8">
        <MenuToolbar
          search={search}
          categoryId={categoryId}
          categories={categories}
          onSearchChange={setSearch}
          onCategoryChange={setCategoryId}
        />
      </div>

      {actionError && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading menu...</p>
        ) : error ? (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : (
          <MenuItemsGrid
            items={items}
            categories={categories}
            search={search}
            categoryId={categoryId}
            allCategoriesValue={ALL_CATEGORIES}
            updatingId={updatingId}
            onToggleAvailability={handleToggleAvailability}
          />
        )}
      </div>
    </div>
  );
}