"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { RestaurantOrdersList } from "@/components/restaurant-orders/RestaurantOrdersList";
import { useOwnerRestaurant } from "@/hooks/useOwnerRestaurant";
import { isIncomingOrder } from "@/lib/order-status";
import { updateRestaurantOrder } from "@/services/orders";

export default function RestaurantOrdersPage() {
  const { orders, loading, error, reload } = useOwnerRestaurant();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const incomingCount = useMemo(
    () => orders.filter((order) => isIncomingOrder(order.status)).length,
    [orders],
  );

  // PENDING orders are handled in the incoming queue, so they are
  // excluded here to keep one screen per decision.
  const managed = useMemo(
    () => orders.filter((order) => !isIncomingOrder(order.status)),
    [orders],
  );

  async function handleTransition(id: string, status: string) {
    setUpdatingId(id);
    setActionError("");

    try {
      await updateRestaurantOrder(id, status);
      await reload();
      toast.success("Order updated");
    } catch (transitionError) {
      const message =
        transitionError instanceof Error
          ? transitionError.message
          : "Could not update order.";
      setActionError(message);
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-500">
            Restaurant
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Order management
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Manage preparation and monitor deliveries.
          </p>
        </div>

        <Link
          href="/restaurant/orders/incoming"
          className="flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 sm:self-auto"
        >
          Incoming orders
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-orange-600">
            {incomingCount}
          </span>
        </Link>
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
          <RestaurantOrdersList
            orders={managed}
            updatingId={updatingId}
            actionError={actionError}
            onTransition={handleTransition}
          />
        )}
      </div>
    </div>
  );
}