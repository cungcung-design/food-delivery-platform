"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { RestaurantCard } from "@/components/home/RestaurantCard";
import {
  isBrowseCategory,
  restaurantMatchesCategory,
} from "@/lib/browse-categories";
import {
  getRestaurants,
  type Restaurant,
} from "@/services/restaurants";

export function RestaurantSectionTitle() {
  const requested = useSearchParams().get("category");
  const title =
    isBrowseCategory(requested) && requested !== "All"
      ? requested
      : "All restaurants";

  return <h2 className="font-bold text-zinc-950">{title}</h2>;
}

export function RestaurantGrid() {
  const requested = useSearchParams().get("category");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants()
      .then((data) => setRestaurants(data.restaurants ?? []))
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load restaurants.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading restaurants...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  const visible = restaurants.filter((restaurant) =>
    restaurantMatchesCategory(restaurant.name, requested),
  );

  if (restaurants.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No restaurants are open yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-zinc-500">
        {visible.length}{" "}
        {visible.length === 1 ? "restaurant" : "restaurants"}{" "}
        available
      </p>

      {visible.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No restaurants in this category.
        </p>
      ) : (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            id={restaurant.id}
            name={restaurant.name}
            category={restaurant.city}
            imageUrl={restaurant.image_url}
            deliveryTime="20–30 min"
            deliveryFee="RM 5 delivery"
          />
        ))}
      </div>
      )}
    </div>
  );
}
