"use client";

import { useState } from "react";
import { toast } from "sonner";

import { DeliveryAssignmentsList } from "@/components/driver-deliveries/DeliveryAssignmentsList";
import { useDriverDashboard } from "@/hooks/useDriverDashboard";

export default function DriverDeliveriesPage() {
  const { activeDelivery, openDeliveries, accept, loading } =
    useDriverDashboard();

  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // The active delivery is listed first; the dispatch queue follows.
  const deliveries = activeDelivery
    ? [activeDelivery, ...openDeliveries.filter((d) => d.id !== activeDelivery.id)]
    : openDeliveries;

  async function handleAccept(deliveryId: string) {
    setAcceptingId(deliveryId);

    try {
      await accept(deliveryId);
      toast.success("Delivery accepted");
    } catch (acceptError) {
      toast.error(
        acceptError instanceof Error
          ? acceptError.message
          : "Unable to accept the delivery",
      );
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm font-semibold text-orange-500">Driver</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Deliveries
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Your active assignment and any dispatch work available to you.
        </p>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading deliveries...</p>
        ) : (
          <DeliveryAssignmentsList
            deliveries={deliveries}
            acceptingId={acceptingId}
            onAccept={handleAccept}
          />
        )}
      </div>
    </div>
  );
}