"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, MapPin } from "lucide-react";

import { OrderReadiness } from "./OrderReadiness";
import { PickupVerification } from "./PickupVerification";
import { DeliveryPrimaryAction } from "@/components/driver-deliveries/DeliveryPrimaryAction";

interface PickupWorkflowProps {
  deliveryId: string;
  orderReference: string;
  orderStatus: string;
  itemCount: number | null;
  restaurantName: string;
}

/**
 * "I've arrived" is operational acknowledgement only and is never sent to the
 * backend: arrival does not mean the driver holds the order. The only state
 * change on this screen is the ASSIGNED -> PICKED_UP transition, performed by
 * DeliveryPrimaryAction through the advance endpoint.
 */
export function PickupWorkflow({
  deliveryId,
  orderReference,
  orderStatus,
  itemCount,
  restaurantName,
}: PickupWorkflowProps) {
  const [arrived, setArrived] = useState(false);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <h2 className="font-bold">Restaurant arrival</h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          When you reach the restaurant, confirm your arrival before collecting
          the order.
        </p>

        {!arrived ? (
          <button
            type="button"
            onClick={() => setArrived(true)}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 font-bold text-white transition hover:bg-orange-600"
          >
            <MapPin className="size-5" />
            I&apos;ve arrived
          </button>
        ) : (
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
            <CheckCircle2 className="size-5" />
            Arrival confirmed
          </div>
        )}
      </section>

      {arrived && (
        <>
          <OrderReadiness orderStatus={orderStatus} />

          <PickupVerification
            orderReference={orderReference}
            restaurantName={restaurantName}
            itemCount={itemCount}
          />

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <DeliveryPrimaryAction deliveryId={deliveryId} status="ASSIGNED" />
          </section>
        </>
      )}

      <div className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-zinc-400" />

        <p className="leading-6">
          Reporting a pickup problem has no API yet, so no report can be sent
          and no delivery state is changed here. Contact support out of band.
        </p>
      </div>
    </div>
  );
}