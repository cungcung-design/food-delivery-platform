import { Bike, MapPin, Navigation } from "lucide-react";

import type { Address } from "@/services/cart";
import type { Tracking } from "@/services/orders";
import { orderStatusLabel } from "@/lib/order-status";

interface DeliveryDetailsProps {
  address?: Address;
  tracking: Tracking | null;
}

export function DeliveryDetails({
  address,
  tracking,
}: DeliveryDetailsProps) {
  const hasDriver =
    tracking?.latitude != null && tracking?.longitude != null;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold">Delivery details</h2>

      <div className="mt-5 space-y-5">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <MapPin className="size-5 text-orange-500" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold">Delivery address</p>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              {address ? (
                <>
                  {address.address_line}, {address.city}
                </>
              ) : (
                "Address no longer available"
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <Bike className="size-5 text-orange-500" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold">Driver</p>

            <p className="mt-1 text-sm text-zinc-500">
              {hasDriver
                ? "Driver assigned and sharing location"
                : "Waiting for a driver to be assigned"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <Navigation className="size-5 text-orange-500" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold">Delivery status</p>

            <p className="mt-1 text-sm text-zinc-500">
              {tracking?.delivery_status
                ? orderStatusLabel(tracking.delivery_status)
                : "Not dispatched yet"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
