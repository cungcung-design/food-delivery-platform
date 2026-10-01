"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Container } from "@/components/ui/Container";

import { MobileCartBar } from "@/components/restaurant/MobileCartBar";
import { MenuCategories } from "@/components/restaurant/MenuCategories";
import { MenuSection } from "@/components/restaurant/MenuSection";
import { RestaurantHero } from "@/components/restaurant/RestaurantHero";

import {
  getMenu,
  type MenuCategory,
  type MenuItem,
} from "@/services/menu";
import {
  getRestaurant,
  type Restaurant,
} from "@/services/restaurants";
import { getCart } from "@/services/cart";

const ALL = "All";

export default function RestaurantPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = params.id;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [itemCount, setItemCount] = useState(0);
  const [cartTotal, setCartTotal] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = useCallback(async () => {
    const data = await getCart().catch(() => null);

    if (!data) {
      return;
    }

    setItemCount(
      data.cart.items.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
    );
    setCartTotal(data.cart.total);
  }, []);

  useEffect(() => {
    if (!restaurantId) {
      return;
    }

    const timer = window.setTimeout(() => {
      void Promise.all([
        getRestaurant(restaurantId),
        getMenu(restaurantId),
      ])
        .then(([restaurantData, menuData]) => {
          setRestaurant(restaurantData.restaurant);
          setCategories(menuData.categories ?? []);
          setItems(menuData.items ?? []);
        })
        .catch((loadError) => {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load restaurant.",
          );
        })
        .finally(() => setLoading(false));

      void loadCart();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [restaurantId, loadCart]);

  if (loading) {
    return (
      <CustomerLayout>
        <Container className="py-20 text-center text-sm text-zinc-500">
          Loading restaurant...
        </Container>
      </CustomerLayout>
    );
  }

  if (!restaurant) {
    return (
      <CustomerLayout>
        <Container className="py-20 text-center text-sm text-red-600">
          {error || "Restaurant not found."}
        </Container>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <RestaurantHero restaurant={restaurant} />

      <Container>
        {error && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <MenuCategories
          categories={[{ id: ALL, name: ALL }, ...categories]}
          active={activeCategory}
          onSelect={setActiveCategory}
        />

        <MenuSection
          activeCategory={activeCategory}
          categories={categories}
          items={items}
          onCartChanged={loadCart}
        />
      </Container>

      <MobileCartBar itemCount={itemCount} total={cartTotal} />
    </CustomerLayout>
  );
}
