"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/ui/PageLoader";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search } from "lucide-react";

import { getRestaurants, type Restaurant } from "@/services/restaurants";

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void getRestaurants()
        .then((data) => setRestaurants(data.restaurants ?? []))
        .catch((loadError) =>
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load restaurants.",
          ),
        )
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const term = search.trim().toLowerCase();

  const filtered = restaurants.filter((restaurant) =>
    `${restaurant.name} ${restaurant.city} ${restaurant.status}`
      .toLowerCase()
      .includes(term),
  );

  if (loading) {
    return <PageLoader label="Loading restaurants" />;
  }

  if (error) {
    return <ErrorState description={error} />;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-orange-500">Operations</p>

      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        Restaurants
      </h1>

      <p className="mt-2 text-sm text-zinc-500">
        Restaurants registered on the platform.
      </p>

      <div className="mt-8 space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search restaurants..."
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {restaurants.length === 0 ? (
          <EmptyState
            title="No restaurants yet"
            description="Restaurants appear here once an owner registers."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matches"
            description="No restaurant matches your search."
          />
        ) : (
          <>
            {/* Cards on phones; the table only appears once there is room. */}
            <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
              {filtered.map((restaurant) => (
                <article
                  key={restaurant.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold">{restaurant.name}</p>

                    <StatusBadge status={restaurant.status} />
                  </div>

                  <p className="mt-2 text-sm text-zinc-500">
                    {restaurant.address_line}, {restaurant.city}
                  </p>
                </article>
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="border-b border-zinc-100 bg-zinc-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-zinc-500">
                        Restaurant
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-zinc-500">
                        City
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-zinc-500">
                        Coordinates
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-zinc-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {filtered.map((restaurant) => (
                      <tr key={restaurant.id}>
                        <td className="px-6 py-4 text-sm font-semibold">
                          {restaurant.name}
                        </td>

                        <td className="px-6 py-4 text-sm text-zinc-600">
                          {restaurant.city}
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                          {restaurant.latitude != null &&
                          restaurant.longitude != null
                            ? `${restaurant.latitude.toFixed(4)}, ${restaurant.longitude.toFixed(4)}`
                            : "—"}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={restaurant.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
