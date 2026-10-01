"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

import { DeliveryOrderSummary } from "@/components/driver-deliveries/DeliveryOrderSummary";
import { DeliveryProgress } from "@/components/driver-deliveries/DeliveryProgress";
import { DeliveryStatusBadge } from "@/components/driver-deliveries/DeliveryStatusBadge";
import { DropoffDetails } from "@/components/driver-deliveries/DropoffDetails";
import { PickupDetails } from "@/components/driver-deliveries/PickupDetails";
import { DeliveryWorkflow } from "@/components/driver-delivery/DeliveryWorkflow";
import { PickupWorkflow } from "@/components/driver-pickup/PickupWorkflow";
import { DriverTrackingPanel } from "@/components/driver-tracking/DriverTrackingPanel";
import { useDriverDashboard } from "@/hooks/useDriverDashboard";
import { getOrder, getTracking, type Order, type Tracking } from "@/services/orders";
import { getRestaurant, type Restaurant } from "@/services/restaurants";

export default function ActiveDeliveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { activeDelivery, loading } = useDriverDashboard();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [detailError, setDetailError] = useState("");

  const delivery = activeDelivery?.id === id ? activeDelivery : undefined;

  // Restaurant, order items, and drop-off coordinates each come from a
  // different endpoint. All three are authorised for the assigned driver.
  useEffect(() => {
    if (!delivery) {
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(() => {
      void getRestaurant(delivery.restaurant_id)
        .then((data) => {
          if (!cancelled) {
            setRestaurant(data.restaurant);
          }
        })
        .catch(() => undefined);

      void getOrder(delivery.order_id)
        .then((data) => {
          if (!cancelled) {
            setOrder(data.order);
          }
        })
        .catch((orderError) => {
          if (!cancelled) {
            setDetailError(
              orderError instanceof Error
                ? orderError.message
                : "Could not load order details.",
            );
          }
        });

      void getTracking(delivery.order_id)
        .then((data) => {
          if (!cancelled) {
            setTracking(data.tracking);
          }
        })
        .catch(() => undefined);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [delivery]);

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="size-4 animate-spin" />
        Loading delivery...
      </p>
    );
  }

  if (!delivery) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-bold">Delivery not available</h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          This delivery is not currently assigned to you. The backend only
          returns a delivery to the driver who owns it.
        </p>

        <Link
          href="/driver/deliveries"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-600"
        >
          <ArrowLeft className="size-4" />
          Back to deliveries
        </Link>
      </div>
    );
  }

  const orderReference = delivery.order_id.slice(0, 8).toUpperCase();

  const items = (order?.items ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
  }));

  const itemCount =
    items.length > 0
      ? items.reduce((total, item) => total + item.quantity, 0)
      : null;

  const dropoff = {
    latitude: tracking?.dropoff_latitude ?? null,
    longitude: tracking?.dropoff_longitude ?? null,
  };

  const hasDropoff = dropoff.latitude != null && dropoff.longitude != null;
  const isPickup = delivery.status === "ASSIGNED";
  const isDelivering =
    delivery.status === "PICKED_UP" || delivery.status === "OUT_FOR_DELIVERY";

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/driver/deliveries"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-950"
      >
        <ArrowLeft className="size-4" />
        Deliveries
      </Link>

      <div className="mt-6">
        <p className="text-sm font-semibold text-orange-500">Active delivery</p>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Order #{orderReference}
          </h1>

          <DeliveryStatusBadge status={delivery.status} />
        </div>
      </div>

      <div className="mt-8">
        <DeliveryProgress status={delivery.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <PickupDetails
            restaurant={
              restaurant
                ? {
                    name: restaurant.name,
                    address: `${restaurant.address_line}, ${restaurant.city}`,
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                  }
                : null
            }
          />

          {hasDropoff && <DropoffDetails dropoff={dropoff} />}

          {isPickup && (
            <PickupWorkflow
              deliveryId={delivery.id}
              orderReference={orderReference}
              orderStatus={delivery.order_status}
              itemCount={itemCount}
              restaurantName={restaurant?.name ?? "Restaurant"}
            />
          )}

          {isDelivering && (
            <DeliveryWorkflow
              deliveryId={delivery.id}
              status={delivery.status}
              orderReference={orderReference}
              dropoffLatitude={dropoff.latitude}
              dropoffLongitude={dropoff.longitude}
            />
          )}

          {delivery.status === "DELIVERED" && (
            <section className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
              <CheckCircle2 className="mx-auto size-10 text-green-600" />

              <h2 className="mt-3 text-lg font-bold text-green-900">
                Delivery completed
              </h2>

              <p className="mt-1 text-sm text-green-700">
                This order has been delivered successfully.
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {isDelivering && (
            <DriverTrackingPanel orderId={delivery.order_id} />
          )}

          {items.length > 0 && <DeliveryOrderSummary items={items} />}

          {detailError && (
            <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {detailError}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}