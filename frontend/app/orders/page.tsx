"use client";

import { useEffect, useState } from "react";

import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Container } from "@/components/ui/Container";

import { ActiveOrders } from "@/components/orders/ActiveOrders";
import { EmptyOrders } from "@/components/orders/EmptyOrders";
import { PreviousOrders } from "@/components/orders/PreviousOrders";

import { getMyOrders, Order } from "@/services/orders";
import { getRestaurants } from "@/services/restaurants";
import { isActiveOrder } from "@/lib/order-status";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantNames, setRestaurantNames] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyOrders()
      .then((data) => {
        const list = data.orders ?? [];
        setOrders(list);

        const missing = Array.from(
          new Set(
            list
              .map((order) => order.restaurant_id)
              .filter((id) => Boolean(id)),
          ),
        );

        if (missing.length === 0) {
          return;
        }

        getRestaurants()
          .then((restaurantData) => {
            const names: Record<string, string> = {};

            for (const restaurant of restaurantData.restaurants ?? []) {
              names[restaurant.id] = restaurant.name;
            }

            setRestaurantNames(names);
          })
          .catch(() => undefined);
      })
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load orders.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const active = orders.filter((order) => isActiveOrder(order.status));
  const previous = orders.filter((order) => !isActiveOrder(order.status));

  return (
    <CustomerLayout>
      <Container className="py-8 sm:py-12">
        <div>
          <p className="text-sm font-semibold text-orange-500">
            Your activity
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Orders
          </h1>

          <p className="mt-2 text-zinc-500">
            Track active deliveries and view your previous orders.
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-12 text-sm text-zinc-500">Loading orders...</p>
        ) : orders.length === 0 && !error ? (
          <EmptyOrders />
        ) : (
          <div className="mt-9 space-y-12">
            <ActiveOrders
              orders={active}
              restaurantNames={restaurantNames}
            />

            <PreviousOrders
              orders={previous}
              restaurantNames={restaurantNames}
            />
          </div>
        )}
      </Container>
    </CustomerLayout>
  );
}
