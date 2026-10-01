"use client";

import { useMemo } from "react";

import { IncomingOrdersList } from "@/components/restaurant-orders/IncomingOrdersList";
import { useOwnerRestaurant } from "@/hooks/useOwnerRestaurant";
import { isIncomingOrder } from "@/lib/order-status";

export default function IncomingOrdersPage() {
  const { orders, loading, error, reload } = useOwnerRestaurant();

  const incoming = useMemo(
    () => orders.filter((order) => isIncomingOrder(order.status)),
    [orders],
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-500">Orders</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Incoming orders
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Review new orders before they enter your kitchen
            workflow.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 sm:self-auto">
          <span
            className={`size-2 rounded-full bg-amber-500 ${
              incoming.length > 0 ? "animate-pulse" : ""
            }`}
          />
          {incoming.length} waiting
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading orders...</p>
        ) : (
          <IncomingOrdersList
            orders={incoming}
            onResolved={reload}
          />
        )}
      </div>
    </div>
  );
}