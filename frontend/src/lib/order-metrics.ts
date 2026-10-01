import type { Order } from "@/services/orders";
import {
  DELIVERY_STATUSES,
  isActiveOrder,
  isIncomingOrder,
} from "@/lib/order-status";

export interface OrderMetrics {
  todayRevenue: number;
  todayOrderCount: number;
  activeOrderCount: number;
  incomingCount: number;
  averageOrderValue: number;
  statusCounts: { status: string; count: number }[];
  recentOrders: Order[];
}

function isToday(createdAt: string): boolean {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Derives dashboard figures from the owner's own order list. The owner
 * endpoint returns orders scoped by ownership, so no cross-restaurant
 * data is involved.
 */
export function computeOrderMetrics(orders: Order[]): OrderMetrics {
  const today = orders.filter((order) => isToday(order.created_at));

  // Cancelled and rejected orders were never completed, so they are not
  // counted as revenue.
  const completedToday = today.filter(
    (order) => order.status !== "CANCELLED" && order.status !== "REJECTED",
  );

  const todayRevenue = completedToday.reduce(
    (sum, order) => sum + toNumber(order.total),
    0,
  );

  const todayOrderCount = today.length;

  const averageOrderValue =
    completedToday.length === 0
      ? 0
      : todayRevenue / completedToday.length;

  const statusMap = new Map<string, number>();

  for (const order of orders) {
    statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1);
  }

  const statusCounts = Array.from(statusMap.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  return {
    todayRevenue,
    todayOrderCount,
    activeOrderCount: orders.filter((order) => isActiveOrder(order.status))
      .length,
    incomingCount: orders.filter((order) => isIncomingOrder(order.status))
      .length,
    averageOrderValue,
    statusCounts,
    recentOrders: orders.slice(0, 8),
  };
}

export function isDeliveryStatus(status: string): boolean {
  return (DELIVERY_STATUSES as readonly string[]).includes(status);
}