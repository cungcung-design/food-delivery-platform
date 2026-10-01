"use client";

import { IncomingOrderCard } from "./IncomingOrderCard";
import { EmptyIncomingOrders } from "./EmptyIncomingOrders";
import type { Order } from "@/services/orders";

interface IncomingOrdersListProps {
  orders: Order[];
  onResolved: () => void | Promise<void>;
}

export function IncomingOrdersList({
  orders,
  onResolved,
}: IncomingOrdersListProps) {
  if (orders.length === 0) {
    return <EmptyIncomingOrders />;
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => (
        <IncomingOrderCard
          key={order.id}
          order={order}
          onResolved={onResolved}
        />
      ))}
    </div>
  );
}