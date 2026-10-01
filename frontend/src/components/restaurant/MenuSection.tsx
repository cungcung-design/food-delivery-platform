"use client";

import { useState } from "react";
import { toast } from "sonner";

import { MenuItemCard } from "./MenuItemCard";
import type { MenuCategory, MenuItem } from "@/services/menu";
import { addCartItem } from "@/services/cart";

interface MenuSectionProps {
  categories: MenuCategory[];
  items: MenuItem[];
  activeCategory: string;
  onCartChanged: () => void | Promise<void>;
}

export function MenuSection({
  items,
  activeCategory,
  onCartChanged,
}: MenuSectionProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const visible =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category_id === activeCategory);

  async function add(item: MenuItem) {
    setBusyId(item.id);
    setError("");

    try {
      await addCartItem(item.id, 1);
      await onCartChanged();
      toast.success("Added to cart");
    } catch (addError) {
      const message =
        addError instanceof Error
          ? addError.message
          : "Could not add item to cart.";
      setError(message);
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <section className="py-10">
        <h2 className="text-2xl font-bold tracking-tight">Menu</h2>

        <p className="mt-2 text-sm text-zinc-500">
          This restaurant has not published any menu items yet.
        </p>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Menu</h2>

        <p className="mt-1 text-sm text-zinc-500">
          {visible.length} {visible.length === 1 ? "item" : "items"}
        </p>
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {visible.map((item) => (
          <MenuItemCard
            key={item.id}
            name={item.name}
            description={item.description ?? ""}
            price={item.price}
            available={item.is_available}
            busy={busyId === item.id}
            onAdd={() => add(item)}
          />
        ))}
      </div>
    </section>
  );
}
