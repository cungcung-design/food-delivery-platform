import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { RestaurantCard } from "./RestaurantCard";

const restaurants = [
  {
    id: "burger-house",
    name: "Burger House",
    category: "Burgers • American",
    rating: 4.8,
    deliveryTime: "20–30 min",
    deliveryFee: "RM 3 delivery",
  },
  {
    id: "tokyo-bowl",
    name: "Tokyo Bowl",
    category: "Japanese • Asian",
    rating: 4.7,
    deliveryTime: "25–35 min",
    deliveryFee: "RM 4 delivery",
  },
  {
    id: "pizza-corner",
    name: "Pizza Corner",
    category: "Pizza • Italian",
    rating: 4.9,
    deliveryTime: "20–25 min",
    deliveryFee: "Free delivery",
  },
];

export function PopularRestaurants() {
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

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              {...restaurant}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}