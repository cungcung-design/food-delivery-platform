import { MapPin } from "lucide-react";

import { Container } from "@/components/ui/Container";
import type { Restaurant } from "@/services/restaurants";

interface RestaurantHeroProps {
  restaurant: Restaurant;
}

const STATUS_STYLES: Record<
  Restaurant["status"],
  { label: string; className: string }
> = {
  OPEN: {
    label: "Open",
    className: "bg-green-50 text-green-700",
  },
  CLOSED: {
    label: "Closed",
    className: "bg-red-50 text-red-700",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "bg-zinc-100 text-zinc-600",
  },
};

export function RestaurantHero({
  restaurant,
}: RestaurantHeroProps) {
  const status = STATUS_STYLES[restaurant.status];

  return (
    <>
      <div className="relative h-48 overflow-hidden bg-zinc-200 sm:h-64 lg:h-80">
        {restaurant.image_url && (
          // Photos are stored as external URLs, so the browser loads them directly.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={restaurant.image_url}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </div>

      <Container>
        <div className="relative -mt-10 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
              >
                {status.label}
              </span>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {restaurant.name}
              </h1>

              {restaurant.description && (
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
                  {restaurant.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <MapPin className="size-4" />
              {restaurant.address_line}, {restaurant.city}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
