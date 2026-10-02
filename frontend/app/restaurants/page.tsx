import { Suspense } from "react";

import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Container } from "@/components/ui/Container";

import { CategoryFilters } from "@/components/restaurants/CategoryFilters";
import { RestaurantFilters } from "@/components/restaurants/RestaurantFilters";
import {
  RestaurantGrid,
  RestaurantSectionTitle,
} from "@/components/restaurants/RestaurantGrid";
import { RestaurantSearch } from "@/components/restaurants/RestaurantSearch";

export default function RestaurantsPage() {
  return (
    <CustomerLayout>
      <section className="border-b border-zinc-100 bg-zinc-50">
        <Container className="py-8 sm:py-10">
          <p className="text-sm font-semibold text-orange-500">
            Discover
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Restaurants near you
          </h1>

          <p className="mt-3 max-w-xl text-zinc-600">
            Find something delicious from restaurants
            around you.
          </p>

          <div className="mt-6 max-w-2xl">
            <RestaurantSearch />
          </div>
        </Container>
      </section>

      <Container className="py-7 sm:py-10">
        <div className="flex flex-col gap-5">
          <Suspense>
            <CategoryFilters />
          </Suspense>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Suspense
                fallback={
                  <h2 className="font-bold text-zinc-950">All restaurants</h2>
                }
              >
                <RestaurantSectionTitle />
              </Suspense>
            </div>

            <RestaurantFilters />
          </div>

          <Suspense
            fallback={
              <p className="text-sm text-zinc-500">Loading restaurants...</p>
            }
          >
            <RestaurantGrid />
          </Suspense>
        </div>
      </Container>
    </CustomerLayout>
  );
}