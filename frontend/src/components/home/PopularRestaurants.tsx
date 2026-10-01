"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/Container";
import {
  getRestaurants,
  type Restaurant,
} from "@/services/restaurants";
import { RestaurantCard } from "./RestaurantCard";

export function PopularRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    getRestaurants()
      .then((data) => setRestaurants((data.restaurants ?? []).slice(0, 3)))
      .catch(() => setRestaurants([]));
  }, []);

  return (
    <section className="bg-zinc-50 py-12 sm:py-16">
      <Container>
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-orange-500">
              Near you
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Popular restaurants
            </h2>
          </div>

          <Link
            href="/restaurants"
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-orange-600"
          >
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {restaurants.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No restaurants are open yet.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                category={restaurant.city}
                deliveryTime="20–30 min"
                deliveryFee="RM 5 delivery"
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
