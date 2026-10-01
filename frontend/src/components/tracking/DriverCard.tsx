import { Bike } from "lucide-react";

import type { Tracking } from "@/services/orders";

interface DriverCardProps {
  tracking: Tracking | null;
}

/**
 * The tracking endpoint returns coordinates and delivery status only.
 * Driver identity, rating, and contact channels are not exposed by the
 * API yet, so nothing is invented here.
 */
export function DriverCard({ tracking }: DriverCardProps) {
  const hasDriver =
    tracking?.latitude != null && tracking?.longitude != null;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <p className="text-sm font-semibold text-zinc-500">Your driver</p>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-zinc-100">
          <Bike className="size-6 text-zinc-400" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold">
            {hasDriver ? "Driver assigned" : "Not assigned yet"}
          </h3>

          <p className="mt-1 text-sm leading-5 text-zinc-500">
            {hasDriver
              ? "This courier is sharing live location for your order."
              : "We will show the courier here once one accepts your delivery."}
          </p>
        </div>
      </div>
    </section>
  );
}
