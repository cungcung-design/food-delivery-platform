export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DRIVER_ASSIGNED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REJECTED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const ACTIVE: ReadonlySet<string> = new Set([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DRIVER_ASSIGNED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
]);

const LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  DRIVER_ASSIGNED: "Driver assigned",
  PICKED_UP: "Picked up",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

const STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PREPARING: "bg-orange-50 text-orange-700",
  READY: "bg-purple-50 text-purple-700",
  DRIVER_ASSIGNED: "bg-indigo-50 text-indigo-700",
  PICKED_UP: "bg-cyan-50 text-cyan-700",
  OUT_FOR_DELIVERY: "bg-cyan-50 text-cyan-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-zinc-100 text-zinc-600",
  REJECTED: "bg-red-50 text-red-700",
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function orderStatusLabel(value: string): string {
  return isOrderStatus(value) ? LABELS[value] : value;
}

export function orderStatusStyle(value: string): string {
  return isOrderStatus(value)
    ? STYLES[value]
    : "bg-zinc-100 text-zinc-600";
}

export function isActiveOrder(value: string): boolean {
  return ACTIVE.has(value);
}

/**
 * Mirrors the backend transitions map in internal/order/service.go.
 * A customer may only move an order to CANCELLED from PENDING or
 * CONFIRMED. The backend re-checks this, so this is display-only.
 */
export function canCustomerCancel(value: string): boolean {
  return value === "PENDING" || value === "CONFIRMED";
}

/**
 * Live tracking is only meaningful once a driver is attached to the
 * delivery. Delivery status moves are driven by the driver.
 */
export function canTrackOrder(value: string): boolean {
  return (
    value === "DRIVER_ASSIGNED" ||
    value === "PICKED_UP" ||
    value === "OUT_FOR_DELIVERY"
  );
}

/**
 * Mirrors the RESTAURANT role column of the backend transitions map.
 * A restaurant owns exactly two kitchen moves: CONFIRMED to PREPARING
 * and PREPARING to READY. Accept and reject are handled separately
 * because both start from PENDING.
 */
export function nextKitchenStatus(value: string): string | null {
  if (value === "CONFIRMED") {
    return "PREPARING";
  }

  if (value === "PREPARING") {
    return "READY";
  }

  return null;
}

/**
 * A PENDING order is one the restaurant has not yet responded to.
 */
export function isIncomingOrder(value: string): boolean {
  return value === "PENDING";
}

export const KITCHEN_STATUSES = [
  "CONFIRMED",
  "PREPARING",
  "READY",
] as const;

export const DELIVERY_STATUSES = [
  "DRIVER_ASSIGNED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
] as const;
