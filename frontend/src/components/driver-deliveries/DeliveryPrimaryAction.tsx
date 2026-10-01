"use client";

import { useState } from "react";
import { toast } from "sonner";

import { CheckCircle2, Loader2, PackageCheck, Bike } from "lucide-react";

import { useDriverDashboard } from "@/hooks/useDriverDashboard";

interface DeliveryPrimaryActionProps {
  deliveryId: string;
  status: string;
}

/**
 * Every button here maps 1:1 onto `POST /api/driver/deliveries/:id/advance`.
 * The backend validates ownership and the current state, and it is the only
 * place the driver status and order status are updated.
 */
export function DeliveryPrimaryAction({
  deliveryId,
  status,
}: DeliveryPrimaryActionProps) {
  const { advance } = useDriverDashboard();
  const [submitting, setSubmitting] = useState(false);

  async function handleAdvance(next: "PICKED_UP" | "OUT_FOR_DELIVERY" | "DELIVERED") {
    setSubmitting(true);

    try {
      await advance(deliveryId, next);
      toast.success(
        next === "PICKED_UP"
          ? "Pickup confirmed"
          : next === "OUT_FOR_DELIVERY"
            ? "Delivery started"
            : "Delivery completed",
      );
    } catch (advanceError) {
      toast.error(
        advanceError instanceof Error
          ? advanceError.message
          : "Unable to update the delivery",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "DELIVERED") {
    return (
      <div className="flex h-14 items-center justify-center gap-2 rounded-xl bg-green-50 font-bold text-green-700">
        <CheckCircle2 className="size-5" />
        Delivery completed
      </div>
    );
  }

  const target =
    status === "ASSIGNED"
      ? "PICKED_UP"
      : status === "PICKED_UP"
        ? "OUT_FOR_DELIVERY"
        : status === "OUT_FOR_DELIVERY"
          ? "DELIVERED"
          : null;

  if (!target) {
    return (
      <div className="rounded-xl bg-zinc-100 p-4 text-center text-sm font-semibold text-zinc-600">
        No action available for this status.
      </div>
    );
  }

  const labels = {
    PICKED_UP: { text: "Confirm pickup", icon: PackageCheck, green: false },
    OUT_FOR_DELIVERY: { text: "Start delivery", icon: Bike, green: false },
    DELIVERED: {
      text: "Confirm delivered",
      icon: CheckCircle2,
      green: true,
    },
  } as const;

  const config = labels[target];

  return (
    <button
      type="button"
      disabled={submitting}
      onClick={() => handleAdvance(target)}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-xl px-6 font-bold text-white transition disabled:opacity-60 ${
        config.green
          ? "bg-green-600 hover:bg-green-700"
          : "bg-orange-500 hover:bg-orange-600"
      }`}
    >
      {submitting ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <config.icon className="size-5" />
      )}

      {submitting ? "Updating..." : config.text}
    </button>
  );
}