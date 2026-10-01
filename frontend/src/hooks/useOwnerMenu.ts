"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getOwnerMenu,
  type MenuCategory,
  type MenuItem,
} from "@/services/menu";
import { useOwnerRestaurant } from "@/hooks/useOwnerRestaurant";

interface OwnerMenuContextValue {
  categories: MenuCategory[];
  items: MenuItem[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}

const EMPTY: OwnerMenuContextValue = {
  categories: [],
  items: [],
  loading: true,
  error: "",
  reload: async () => undefined,
};

export function useOwnerMenu(): OwnerMenuContextValue {
  const { restaurant } = useOwnerRestaurant();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!restaurant) {
      return;
    }

    const data = await getOwnerMenu(restaurant.id);

    setCategories(data.categories ?? []);
    setItems(data.items ?? []);
  }, [restaurant]);

  useEffect(() => {
    if (!restaurant) {
      return;
    }

    const timer = window.setTimeout(() => {
      void load()
        .catch((loadError) => {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load menu.",
          );
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [restaurant, load]);

  return {
    categories,
    items,
    loading,
    error,
    reload: async () => {
      setError("");

      try {
        await load();
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load menu.",
        );
      }
    },
  };
}

export { EMPTY };