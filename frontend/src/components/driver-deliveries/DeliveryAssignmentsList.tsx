"use client";

import { useEffect, useState } from "react";

import { DeliveryAssignmentCard } from "./DeliveryAssignmentCard";
import { EmptyAssignments } from "./EmptyAssignments";
import type { DeliveryJob } from "@/services/driver";
import { getRestaurant, type Restaurant } from "@/services/restaurants";

interface DeliveryAssignmentsListProps {
  deliveries: DeliveryJob[];
  acceptingId: string | null;
  onAccept: (deliveryId: string) => void;
}

/** Public restaurant lookup is keyed by ID; cache one entry per delivery. */
function useRestaurantNames(deliveries: DeliveryJob[]) {
  const [restaurants, setRestaurants] = useState<Record<string, Restaurant>>(
    {},
  );

  useEffect(() => {
    const missing = deliveries
      .map((delivery) => delivery.restaurant_id)
      .filter((id) => !(id in restaurants));

    if (missing.length === 0) {
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(() => {
      void Promise.all(
        missing.map((id) =>
          getRestaurant(id)
            .then((data) => [id, data.restaurant] as const)
            // A missing restaurant must not break the whole list.
            .catch(() => null),
        ),
      ).then((results) => {
        if (cancelled) {
          return;
        }

        setRestaurants((current) => {
          const next = { ...current };

          for (const entry of results) {
            if (entry) {
              next[entry[0]] = entry[1];
            }
          }

          return next;
        });
      });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [deliveries, restaurants]);

  return restaurants;
}

export function DeliveryAssignmentsList({
  deliveries,
  acceptingId,
  onAccept,
}: DeliveryAssignmentsListProps) {
  const restaurants = useRestaurantNames(deliveries);

  if (deliveries.length === 0) {
    return <EmptyAssignments />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {deliveries.map((delivery) => {
        const restaurant = restaurants[delivery.restaurant_id];

        return (
          <DeliveryAssignmentCard
            key={delivery.id}
            delivery={delivery}
            restaurantName={restaurant?.name}
            restaurantAddress={
              restaurant
                ? `${restaurant.address_line}, ${restaurant.city}`
                : undefined
            }
            accepting={acceptingId === delivery.id}
            onAccept={onAccept}
          />
        );
      })}
    </div>
  );
}