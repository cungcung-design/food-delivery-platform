"use client";

import { Bike, MapPin } from "lucide-react";

import { DeliveryPrimaryAction } from "@/components/driver-deliveries/DeliveryPrimaryAction";

interface DeliveryWorkflowProps {
  deliveryId: string;
  status: string;
  orderReference: string;
  dropoffLatitude: number | null;
  dropoffLongitude: number | null;
}

/**
 * PICKED_UP and OUT_FOR_DELIVERY share the same screen: the destination is
 * fixed, so the only change is which transition the primary action posts.
 */
export function DeliveryWorkflow({
  deliveryId,
  status,
  orderReference,
  dropoffLatitude,
  dropoffLongitude,
}: DeliveryWorkflowProps) {
  const pickedUp = status === "PICKED_UP";
  const hasCoordinates = dropoffLatitude != null && dropoffLongitude != null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            {pickedUp ? (
              <Bike className="size-5 text-orange-600" />
            ) : (
              <MapPin className="size-5 text-orange-600" />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="font-bold">
              {pickedUp ? "Ready to deliver" : "Customer destination"}
            </h2>

            <p className="text-sm text-zinc-500">
              {pickedUp
                ? "Start the delivery when you're ready."
                : "Deliver the order to the customer."}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-bold uppercase text-zinc-400">
            Destination
          </p>

          {hasCoordinates ? (
            <>
              <p className="mt-2 text-sm font-medium">
                {dropoffLatitude!.toFixed(5)}, {dropoffLongitude!.toFixed(5)}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Street address and navigation are not available to drivers
                yet. Deliver to order #{orderReference}.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">
              No drop-off coordinates were recorded for order #
              {orderReference}.
            </p>
          )}
        </div>

        <div className="mt-4">
          <DeliveryPrimaryAction deliveryId={deliveryId} status={status} />
        </div>

        <p className="mt-3 text-center text-xs text-zinc-500">
          Reporting a delivery problem has no API yet, so no report can be
          sent and no delivery state is changed here.
        </p>
      </section>
    </div>
  );
}