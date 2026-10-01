"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMyRestaurants,
  type Restaurant,
} from "@/services/restaurants";
import {
  getRestaurantOrders,
  type Order,
} from "@/services/orders";

interface OwnerRestaurantContextValue {
  restaurants: Restaurant[];
  restaurant: Restaurant | undefined;
  orders: Order[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}

const OwnerRestaurantContext =
  createContext<OwnerRestaurantContextValue | null>(null);

/**
 * Loads the authenticated owner's restaurants and their orders once for
 * the whole dashboard. Both endpoints scope by the caller's ownership,
 * so no client-side filtering decides whose data is shown.
 */
export function OwnerRestaurantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [restaurantData, orderData] = await Promise.all([
      getMyRestaurants(),
      getRestaurantOrders(),
    ]);

    setRestaurants(restaurantData.restaurants ?? []);
    setOrders(orderData.orders ?? []);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
        .catch((loadError) => {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load restaurant data.",
          );
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const value = useMemo<OwnerRestaurantContextValue>(
    () => ({
      restaurants,
      restaurant: restaurants[0],
      orders,
      loading,
      error,
      reload: load,
    }),
    [restaurants, orders, loading, error, load],
  );

  return (
    <OwnerRestaurantContext.Provider value={value}>
      {children}
    </OwnerRestaurantContext.Provider>
  );
}

export function useOwnerRestaurant(): OwnerRestaurantContextValue {
  const context = useContext(OwnerRestaurantContext);

  if (!context) {
    throw new Error(
      "useOwnerRestaurant must be used inside OwnerRestaurantProvider",
    );
  }

  return context;
}