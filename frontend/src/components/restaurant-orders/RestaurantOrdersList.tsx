"use client";

import { useMemo, useState } from "react";

import { OrderFilters, type OrderFilter } from "./OrderFilters";
import { RestaurantOrderCard } from "./RestaurantOrderCard";
import { OrdersEmptyState } from "./OrdersEmptyState";
import type { Order } from "@/services/orders";
import { DELIVERY_STATUSES } from "@/lib/order-status";

interface RestaurantOrdersListProps {
  orders: Order[];
  onTransition: (id: string, status: string) => void;
  updatingId: string | null;
  actionError: string;
}

function matchesFilter(
  status: string,
  filter: OrderFilter,
): boolean {
  if (filter === "ALL") {
    return true;
  }

  if (filter === "DELIVERY") {
    return (DELIVERY_STATUSES as readonly string[]).includes(status);
  }

  if (filter === "COMPLETED") {
    return (
      status === "DELIVERED" ||
      status === "CANCELLED" ||
      status === "REJECTED"
    );
  }

  return status === filter;
}

export function RestaurantOrdersList({
  orders,
  onTransition,
  updatingId,
  actionError,
}: RestaurantOrdersListProps) {
  const [filter, setFilter] = useState<OrderFilter>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch = !query || order.id.includes(query);

      return matchesSearch && matchesFilter(order.status, filter);
    });
  }, [orders, filter, search]);

  return (
    <div>
      <OrderFilters
        filter={filter}
        search={search}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
      />

      {actionError && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {filtered.length > 0 ? (
        <div className="mt-6 space-y-4">
          {filtered.map((order) => (
            <RestaurantOrderCard
              key={order.id}
              order={order}
              updating={updatingId === order.id}
              onTransition={onTransition}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <OrdersEmptyState />
        </div>
      )}
    </div>
  );
}