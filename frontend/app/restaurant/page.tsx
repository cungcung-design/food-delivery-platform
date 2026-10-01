"use client";

import { useMemo } from "react";

import { DashboardStats } from "@/components/restaurant-dashboard/DashboardStats";
import { IncomingOrderAlert } from "@/components/restaurant-dashboard/IncomingOrderAlert";
import { OrderStatusOverview } from "@/components/restaurant-dashboard/OrderStatusOverview";
import { RecentOrders } from "@/components/restaurant-dashboard/RecentOrders";

import { useOwnerRestaurant } from "@/hooks/useOwnerRestaurant";
import { computeOrderMetrics } from "@/lib/order-metrics";

function greeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export default function RestaurantDashboardPage() {
  const { orders, restaurant, loading, error } = useOwnerRestaurant();

  const metrics = useMemo(() => computeOrderMetrics(orders), [orders]);

  const newestIncoming = useMemo(
    () => orders.find((order) => order.status === "PENDING"),
    [orders],
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm font-semibold text-orange-500">
          Restaurant dashboard
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting()}
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Here&apos;s what&apos;s happening with{" "}
          {restaurant?.name ?? "your restaurant"} today.
        </p>
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-12 text-sm text-zinc-500">
          Loading dashboard...
        </p>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
          <p className="font-semibold">No orders yet</p>

          <p className="mt-2 text-sm text-zinc-500">
            Customer orders for your restaurant will appear
            here.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8">
            <DashboardStats
              stats={{
                todayRevenue: metrics.todayRevenue,
                todayOrderCount: metrics.todayOrderCount,
                activeOrderCount: metrics.activeOrderCount,
                averageOrderValue: metrics.averageOrderValue,
              }}
            />
          </div>

          {newestIncoming && (
            <div className="mt-6">
              <IncomingOrderAlert order={newestIncoming} />
            </div>
          )}

          <div className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <OrderStatusOverview
              statusCounts={metrics.statusCounts}
            />

            <RecentOrders orders={metrics.recentOrders} />
          </div>
        </>
      )}
    </div>
  );
}