import { OrderCard } from "./OrderCard";
import type { Order } from "@/services/orders";

interface ActiveOrdersProps {
  orders: Order[];
  restaurantNames: Record<string, string>;
}

export function ActiveOrders({
  orders,
  restaurantNames,
}: ActiveOrdersProps) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <section>
      <div>
        <h2 className="text-xl font-bold">Active orders</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Track orders that are currently in progress.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            id={order.id}
            restaurantName={restaurantNames[order.restaurant_id]}
            status={order.status}
            total={order.total}
            createdAt={order.created_at}
          />
        ))}
      </div>
    </section>
  );
}
