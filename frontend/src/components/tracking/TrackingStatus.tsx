import { Bike, Navigation } from "lucide-react";

import type { Tracking } from "@/services/orders";
import { orderStatusLabel } from "@/lib/order-status";

interface TrackingStatusProps {
  tracking: Tracking | null;
}

export function TrackingStatus({ tracking }: TrackingStatusProps) {
  const deliveryStatus = tracking?.delivery_status;
  const orderStatus = tracking?.order_status;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex size-12 items-center justify-center rounded-xl bg-orange-50">
        <Navigation className="size-6 text-orange-500" />
      </div>

      <h2 className="mt-4 text-xl font-bold">
        {deliveryStatus
          ? orderStatusLabel(deliveryStatus)
          : "Preparing for delivery"}
      </h2>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {deliveryStatus
          ? "Your driver is sharing live location for this delivery."
          : "A driver is assigned once the restaurant marks your order ready."}
      </p>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-4">
          <Bike className="size-5 text-zinc-500" />

          <div>
            <p className="text-xs text-zinc-500">Delivery status</p>

            <p className="text-sm font-semibold">
              {deliveryStatus
                ? orderStatusLabel(deliveryStatus)
                : "Not dispatched"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-4">
          <Navigation className="size-5 text-zinc-500" />

          <div>
            <p className="text-xs text-zinc-500">Order status</p>

            <p className="text-sm font-semibold">
              {orderStatus ? orderStatusLabel(orderStatus) : "Unknown"}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-zinc-400">
        Arrival estimates are not available yet. The delivery team
        updates this status directly.
      </p>
    </section>
  );
}
