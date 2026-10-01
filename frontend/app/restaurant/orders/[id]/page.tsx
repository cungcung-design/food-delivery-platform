"use client";

import Link from "next/link";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { OrderItems } from "@/components/orders/OrderItems";
import { OrderPriceSummary } from "@/components/orders/OrderPriceSummary";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { RejectOrderDialog } from "@/components/restaurant-orders/RejectOrderDialog";

import {
  getOrder,
  getTracking,
  updateRestaurantOrder,
  type Order,
  type Tracking,
} from "@/services/orders";
import {
  nextKitchenStatus,
  orderStatusLabel,
} from "@/lib/order-status";

export default function RestaurantOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const timer = window.setTimeout(() => {
      void Promise.all([
        getOrder(orderId),
        getTracking(orderId).catch(() => ({ tracking: null })),
      ])
        .then(([orderData, trackingData]) => {
          setOrder(orderData.order);
          setTracking(trackingData.tracking);
        })
        .catch((loadError) => {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load order.",
          );
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [orderId]);

  async function transition(status: string) {
    setUpdating(true);
    setError("");

    try {
      await updateRestaurantOrder(orderId, status);
      const data = await getOrder(orderId);
      setOrder(data.order);
      toast.success(status === "REJECTED" ? "Order rejected" : "Order updated");
    } catch (transitionError) {
      const message =
        transitionError instanceof Error
          ? transitionError.message
          : "Could not update order.";
      setError(message);
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl py-20 text-center text-sm text-zinc-500">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl py-20 text-center">
        <p className="text-sm text-red-600">
          {error || "Order not found."}
        </p>

        <Link
          href="/restaurant/orders"
          className="mt-4 inline-block text-sm font-semibold text-orange-600"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const next = nextKitchenStatus(order.status);

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/restaurant/orders"
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
      >
        <ChevronLeft className="size-4" />
        Back to orders
      </Link>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-orange-500">
            Order #{order.id.slice(0, 8)}
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {orderStatusLabel(order.status)}
          </h1>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <OrderItems items={order.items ?? []} />

          <OrderStatusTimeline status={order.status} />

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold">Delivery</h2>

            <p className="mt-3 text-sm text-zinc-500">
              Delivery status:{" "}
              {tracking?.delivery_status
                ? orderStatusLabel(tracking.delivery_status)
                : "Not dispatched"}
            </p>
          </section>
        </div>

        <div className="space-y-5">
          <OrderPriceSummary order={order} />

          {next && (
            <button
              type="button"
              onClick={() => transition(next)}
              disabled={updating}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {updating && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {updating
                ? "Updating"
                : order.status === "CONFIRMED"
                  ? "Start preparing"
                  : "Mark as ready"}
            </button>
          )}

          {order.status === "PENDING" && (
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              disabled={updating}
              className="flex h-12 w-full items-center justify-center rounded-xl border border-red-200 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              Reject order
            </button>
          )}
        </div>
      </div>

      <RejectOrderDialog
        open={rejectOpen}
        loading={updating}
        onClose={() => setRejectOpen(false)}
        onConfirm={() => transition("REJECTED")}
      />
    </div>
  );
}