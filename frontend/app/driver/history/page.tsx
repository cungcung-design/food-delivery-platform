"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";

import { DeliveryStatusBadge } from "@/components/driver-deliveries/DeliveryStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime, formatMoney } from "@/lib/format";
import {
  getDriverHistory,
  type CompletedDelivery,
} from "@/services/driver";

export default function DriverHistoryPage() {
  const [deliveries, setDeliveries] = useState<CompletedDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let stop = false;

    getDriverHistory()
      .then((data) => {
        if (!stop) {
          setDeliveries(data.deliveries ?? []);
        }
      })
      .catch((loadError) => {
        if (!stop) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load delivery history.",
          );
        }
      })
      .finally(() => {
        if (!stop) {
          setLoading(false);
        }
      });

    return () => {
      stop = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-orange-500">Driver</p>

      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        Delivery history
      </h1>

      <p className="mt-2 text-sm text-zinc-500">
        Review your completed deliveries.
      </p>

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading history...</p>
        ) : error ? (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : deliveries.length === 0 ? (
          <EmptyState
            title="No delivery history"
            description="Completed deliveries will appear here after you finish them."
          />
        ) : (
          <div className="grid gap-4">
            {deliveries.map((delivery) => (
              <article
                key={delivery.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
              >
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

                <div className="mt-6 flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-50">
                    <Store className="size-4 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">{delivery.restaurant_name}</p>
                    <p className="mt-1 text-sm leading-5 text-zinc-500">
                      {delivery.pickup_address}
                    </p>
                    {delivery.delivered_at && (
                      <p className="mt-2 text-sm text-zinc-500">
                        Delivered {formatDateTime(delivery.delivered_at)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-end justify-between gap-4 border-t border-zinc-100 pt-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Order total</p>
                    <p className="mt-1 font-semibold">
                      {formatMoney(delivery.order_total)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-500">Earning</p>
                    <p className="mt-1 text-lg font-bold">
                      {formatMoney(delivery.earning)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
