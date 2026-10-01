import { MapPin, Store } from "lucide-react";

interface PickupDetailsProps {
  restaurant?: {
    name?: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
}

/**
 * Only name, address, and coordinates are available: the driver API returns
 * `restaurant_id`, and the public restaurant endpoint exposes no phone field.
 */
export function PickupDetails({ restaurant }: PickupDetailsProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-50">
          <Store className="size-5 text-orange-600" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
            Pickup
          </p>

          <h2 className="truncate font-bold">
            {restaurant?.name ?? "Restaurant unavailable"}
          </h2>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <MapPin className="mt-0.5 size-5 shrink-0 text-zinc-400" />

        <div className="min-w-0">
          <p className="text-sm leading-6 text-zinc-600">
            {restaurant?.address ?? "Restaurant address is not available."}
          </p>

          {restaurant?.latitude != null &&
          restaurant?.longitude != null && (
            <p className="mt-1 text-xs text-zinc-400">
              {restaurant.latitude.toFixed(5)},{" "}
              {restaurant.longitude.toFixed(5)}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}