import { Info, MapPin } from "lucide-react";

interface DropoffDetailsProps {
  dropoff?: {
    latitude: number | null;
    longitude: number | null;
  } | null;
}

/**
 * The orders table stores only `delivery_address_id`; address text belongs to
 * the customer and is not returned to drivers, and no phone or delivery-note
 * field exists on the order. Coordinates are the only drop-off data the
 * tracking endpoint provides.
 */
export function DropoffDetails({ dropoff }: DropoffDetailsProps) {
  const hasCoordinates =
    dropoff?.latitude != null && dropoff?.longitude != null;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
          <MapPin className="size-5 text-green-600" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-green-600">
            Drop-off
          </p>

          <h2 className="font-bold">Customer destination</h2>
        </div>
      </div>

      {hasCoordinates ? (
        <div className="mt-5 flex gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-zinc-400" />

          <div>
            <p className="text-sm font-medium text-zinc-700">
              {dropoff!.latitude!.toFixed(5)}, {dropoff!.longitude!.toFixed(5)}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Drop-off coordinates recorded at checkout.
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-sm leading-6 text-zinc-500">
          No drop-off coordinates were recorded for this order.
        </p>
      )}

      <div className="mt-5 flex gap-3 rounded-xl bg-zinc-50 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-zinc-400" />

        <p className="text-sm leading-6 text-zinc-600">
          Customer name, street address, phone, and delivery notes are not
          exposed to the driver API. Navigation and contact actions are left
          out until that data and a map provider are wired up.
        </p>
      </div>
    </section>
  );
}