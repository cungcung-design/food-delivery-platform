"use client";

import Link from "next/link";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Container } from "@/components/ui/Container";

import { DeliveryDetails } from "@/components/orders/DeliveryDetails";
import { OrderActions } from "@/components/orders/OrderActions";
import { OrderItems } from "@/components/orders/OrderItems";
import { OrderPriceSummary } from "@/components/orders/OrderPriceSummary";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";

import {
  getOrder,
  getTracking,
  Order,
  Tracking,
  trackingStreamUrl,
  updateOrderStatus,
} from "@/services/orders";
import { getRestaurant } from "@/services/restaurants";
import { getAddresses } from "@/services/cart";
import type { Address } from "@/services/cart";

import { canCustomerCancel, canTrackOrder } from "@/lib/order-status";

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [address, setAddress] = useState<Address | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!orderId) {
      return;
    }

    const [orderData, trackingData] = await Promise.all([
      getOrder(orderId),
      getTracking(orderId).catch(() => ({ tracking: null })),
    ]);

    const loaded = orderData.order;
    setOrder(loaded);
    setTracking(trackingData.tracking);

    getRestaurant(loaded.restaurant_id)
      .then((data) => setRestaurantName(data.restaurant.name))
      .catch(() => undefined);

    getAddresses()
      .then((data) => {
        const match = (data.addresses ?? []).find(
          (item) => item.id === loaded.delivery_address_id,
        );

        setAddress(match);
      })
      .catch(() => undefined);
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const source = new EventSource(trackingStreamUrl(orderId), {
      withCredentials: true,
    });

    source.addEventListener("tracking", (event) => {
      try {
        setTracking(
          JSON.parse((event as MessageEvent).data) as Tracking,
        );
      } catch {
        // Ignore malformed stream payloads.
      }
    });

    const timer = window.setTimeout(() => {
      void load()
        .catch((loadError) => {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load order.",
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }, 0);

    return () => {
      window.clearTimeout(timer);
      source.close();
    };
  }, [orderId, load]);

  async function cancel() {
    if (!orderId) {
      return;
    }

    setCancelling(true);
    setError("");

    try {
      await updateOrderStatus(orderId, "CANCELLED");
      await load();
      toast.success("Order cancelled");
    } catch (cancelError) {
      const message =
        cancelError instanceof Error
          ? cancelError.message
          : "Could not cancel order.";
      setError(message);
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <CustomerLayout>
        <Container className="py-20 text-center text-sm text-zinc-500">
          Loading order...
        </Container>
      </CustomerLayout>
    );
  }

  if (!order) {
    return (
      <CustomerLayout>
        <Container className="py-20 text-center">
          <p className="text-sm text-red-600">
            {error || "Order not found."}
          </p>

          <Link
            href="/orders"
            className="mt-4 inline-block text-sm font-semibold text-orange-600"
          >
            Back to orders
          </Link>
        </Container>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <Container className="py-8 sm:py-12">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
        >
          <ChevronLeft className="size-4" />
          Back to orders
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-orange-500">
              {restaurantName ?? "Restaurant"}
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Order #{order.id.slice(0, 8)}
            </h1>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <OrderStatusTimeline status={order.status} />

            <OrderItems items={order.items ?? []} />

            <DeliveryDetails
              address={address}
              tracking={tracking}
            />
          </div>

          <div className="space-y-5">
            <OrderPriceSummary order={order} />

            <OrderActions
              orderId={order.id}
              canCancel={canCustomerCancel(order.status)}
              canTrack={canTrackOrder(order.status)}
              cancelling={cancelling}
              error={error}
              onCancel={cancel}
            />

            <Link
              href={`/assistant?order=${order.id}`}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
            >
              Ask the assistant about this order
            </Link>
          </div>
        </div>

        {cancelling && (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500">
            <LoaderCircle className="size-4 animate-spin" />
            Cancelling order...
          </p>
        )}
      </Container>
    </CustomerLayout>
  );
}
