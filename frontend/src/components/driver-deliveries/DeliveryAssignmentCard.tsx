"use client";

import Link from "next/link";
import { ArrowRight, Check, Loader2, MapPin, Store } from "lucide-react";

import type { DeliveryJob } from "@/services/driver";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";

interface DeliveryAssignmentCardProps {
  delivery: DeliveryJob;
  restaurantName?: string;
  restaurantAddress?: string;
  /** True while this specific card's accept call is in flight. */
  accepting?: boolean;
  onAccept?: (deliveryId: string) => void;
}

export function DeliveryAssignmentCard({
  delivery,
  restaurantName,
  restaurantAddress,
  accepting = false,
  onAccept,
}: DeliveryAssignmentCardProps) {
  const isOpen = delivery.status === "UNASSIGNED";

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Order
          </p>

          <h2 className="mt-1 text-lg font-bold">
            #{delivery.order_id.slice(0, 8).toUpperCase()}
          </h2>
        </div>

        <DeliveryStatusBadge status={delivery.status} />
      </div>

      <div className="mt-6">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-50">
            <Store className="size-4 text-orange-600" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Pickup
            </p>

            <p className="mt-1 font-semibold">{restaurantName ?? "—"}</p>

            <p className="mt-1 text-sm leading-5 text-zinc-500">
              {restaurantAddress ?? "Restaurant address not exposed to drivers"}
            </p>
          </div>
        </div>

        <div className="ml-5 h-7 border-l-2 border-dashed border-zinc-200" />

        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50">
            <MapPin className="size-4 text-green-600" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Drop-off
            </p>

            <p className="mt-1 text-sm leading-5 text-zinc-500">
              Customer address is not exposed to drivers. Open the delivery to
              see the drop-off coordinates.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {isOpen ? (
          <button
            type="button"
            disabled={accepting}
            onClick={() => onAccept?.(delivery.id)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
          >
            {accepting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}

            Accept delivery
          </button>
        ) : (
          <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-400">
            Assigned automatically
          </div>
        )}

        <Link
          href={`/driver/deliveries/${delivery.id}`}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          View delivery
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}