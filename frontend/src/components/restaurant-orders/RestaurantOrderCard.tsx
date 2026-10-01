"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import type { Order } from "@/services/orders";
import {
  DELIVERY_STATUSES,
  nextKitchenStatus,
} from "@/lib/order-status";
import { formatMoney, formatTimeAgo } from "@/lib/format";

const ACTION_LABELS: Record<string, string> = {
  CONFIRMED: "Start preparing",
  PREPARING: "Mark as ready",
};

interface RestaurantOrderCardProps {
  order: Order;
  updating?: boolean;
  onTransition: (id: string, status: string) => void;
}

/**
 * A restaurant owns only two kitchen moves, CONFIRMED to PREPARING and
 * PREPARING to READY. Delivery statuses belong to the driver workflow,
 * so they are shown as read-only state here. The backend re-validates
 * every transition regardless of what this renders.
 */
export function RestaurantOrderCard({
  order,
  updating,
  onTransition,
}: RestaurantOrderCardProps) {
  const next = nextKitchenStatus(order.status);
  const inDelivery = (DELIVERY_STATUSES as readonly string[]).includes(
    order.status,
  );

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/restaurant/orders/${order.id}`}
              className="text-lg font-bold transition hover:text-orange-600"
            >
              #{order.id.slice(0, 8)}
            </Link>

            <OrderStatusBadge status={order.status} />
          </div>

          <p className="mt-3 text-sm text-zinc-500">
            Received {formatTimeAgo(order.created_at)} •{" "}
            {order.payment_status}
          </p>
        </div>

        <p className="shrink-0 text-xl font-bold">
          {formatMoney(order.total)}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center">
        {next && (
          <button
            type="button"
            disabled={updating}
            onClick={() => onTransition(order.id, next)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {updating && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            {ACTION_LABELS[order.status] ?? "Update"}
          </button>
        )}

        {order.status === "READY" && (
          <div className="rounded-xl bg-purple-50 px-4 py-3 text-sm font-medium text-purple-700">
            Waiting for driver
          </div>
        )}

        {inDelivery && (
          <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Delivery in progress
          </div>
        )}

        {order.status === "DELIVERED" && (
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            Order completed
          </div>
        )}

        {(order.status === "CANCELLED" || order.status === "REJECTED") && (
          <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-600">
            {order.status === "CANCELLED"
              ? "Cancelled by customer"
              : "Rejected by restaurant"}
          </div>
        )}

        <Link
          href={`/restaurant/orders/${order.id}`}
          className="flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 sm:ml-auto"
        >
          Details
        </Link>
      </div>
    </article>
  );
}