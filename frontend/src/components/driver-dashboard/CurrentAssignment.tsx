"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bike, MapPin, Store } from "lucide-react";

import { useDriverDashboard } from "@/hooks/useDriverDashboard";
import { getRestaurant, type Restaurant } from "@/services/restaurants";

/** Orders have no human-facing reference column, so the UUID prefix is used. */
export function shortOrderId(orderId: string): string {
  return orderId.slice(0, 8).toUpperCase();
}

const DELIVERY_STATUS_LABEL: Record<string, string> = {
  ASSIGNED: "Going to pickup",
  PICKED_UP: "Picked up",
  OUT_FOR_DELIVERY: "On the way",
};

export function CurrentAssignment() {
  const { activeDelivery } = useDriverDashboard();

  const [loaded, setLoaded] = useState<{ id: string; data: Restaurant } | null>(
    null,
  );
  const [restaurantError, setRestaurantError] = useState("");

  const restaurantId = activeDelivery?.restaurant_id;

  // Keyed by id so a stale response can never label the wrong delivery.
  const restaurant =
    loaded && loaded.id === restaurantId ? loaded.data : null;

  useEffect(() => {
    if (!restaurantId) {
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(() => {
      void getRestaurant(restaurantId)
        .then((data) => {
          if (!cancelled) {
            setLoaded({ id: restaurantId, data: data.restaurant });
          }
        })
        .catch((loadError) => {
          if (!cancelled) {
            setRestaurantError(
              loadError instanceof Error
                ? loadError.message
                : "Could not load the restaurant.",
            );
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [restaurantId]);

  if (!activeDelivery) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="flex size-11 items-center justify-center rounded-xl bg-zinc-100">
          <Bike className="size-5 text-zinc-500" />
        </div>

        <h2 className="mt-4 font-bold">No active delivery</h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Your current delivery assignment will appear here when one is
          assigned to you.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-orange-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
            {DELIVERY_STATUS_LABEL[activeDelivery.status] ??
              activeDelivery.status}
          </span>

          <h2 className="mt-3 text-lg font-bold">
            Order #{shortOrderId(activeDelivery.order_id)}
          </h2>
        </div>

        <Bike className="size-6 shrink-0 text-orange-500" />
      </div>

      <div className="mt-6 space-y-5">
        <div className="flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-50">
            <Store className="size-4 text-orange-600" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-zinc-400">
              Pickup
            </p>

            <p className="mt-1 font-semibold">
              {restaurant?.name ?? "Loading restaurant"}
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              {restaurant
                ? `${restaurant.address_line}, ${restaurant.city}`
                : (restaurantError || "Address unavailable")}
            </p>
          </div>
        </div>

        <div className="ml-4 h-5 border-l-2 border-dashed border-zinc-200" />

        <div className="flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-50">
            <MapPin className="size-4 text-green-600" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-zinc-400">
              Drop-off
            </p>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              The customer address is not exposed to the driver API yet.
              Coordinates are available on the delivery screen.
            </p>
          </div>
        </div>
      </div>

      <Link
        href={`/driver/deliveries/${activeDelivery.id}`}
        className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600"
      >
        View delivery
        <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}