"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, Package } from "lucide-react";

import { RejectOrderDialog } from "./RejectOrderDialog";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import {
  getOrder,
  updateRestaurantOrder,
  type Order,
  type OrderItem,
} from "@/services/orders";
import { formatMoney, formatTimeAgo } from "@/lib/format";

interface IncomingOrderCardProps {
  order: Order;
  onResolved: () => void | Promise<void>;
}

/**
 * The owner order list omits line items, so the detail endpoint is used
 * to load them. That endpoint enforces restaurant ownership server-side.
 */
export function IncomingOrderCard({
  order,
  onResolved,
}: IncomingOrderCardProps) {
  const [items, setItems] = useState<OrderItem[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let stop = false;

    const timer = window.setTimeout(() => {
      void getOrder(order.id)
        .then((data) => {
          if (!stop) {
            setItems(data.order.items ?? []);
          }
        })
        .catch((detailError) => {
          if (!stop) {
            setLoadError(
              detailError instanceof Error
                ? detailError.message
                : "Could not load order items.",
            );
          }
        });
    }, 0);

    return () => {
      stop = true;
      window.clearTimeout(timer);
    };
  }, [order.id]);

  async function handleAccept() {
    setAccepting(true);
    setActionError("");

    try {
      await updateRestaurantOrder(order.id, "CONFIRMED");
      await onResolved();
      toast.success("Order accepted");
    } catch (acceptError) {
      const message =
        acceptError instanceof Error
          ? acceptError.message
          : "Could not accept order.";
      setActionError(message);
      toast.error(message);
    } finally {
      setAccepting(false);
    }
  }

  async function handleReject() {
    setRejecting(true);
    setActionError("");

    try {
      await updateRestaurantOrder(order.id, "REJECTED");
      setRejectOpen(false);
      await onResolved();
      toast.success("Order rejected");
    } catch (rejectError) {
      const message =
        rejectError instanceof Error
          ? rejectError.message
          : "Could not reject order.";
      setActionError(message);
      toast.error(message);
    } finally {
      setRejecting(false);
    }
  }

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold">
                Order #{order.id.slice(0, 8)}
              </h2>

              <OrderStatusBadge status={order.status} />
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              Received {formatTimeAgo(order.created_at)}
            </p>
          </div>

          <p className="shrink-0 text-xl font-bold">
            {formatMoney(order.total)}
          </p>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-zinc-500" />

              <h3 className="font-semibold">Order items</h3>
            </div>

            {loadError ? (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {loadError}
              </p>
            ) : items === null ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                <LoaderCircle className="size-4 animate-spin" />
                Loading items...
              </div>
            ) : items.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">
                No line items on this order.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-zinc-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-4 first:pt-0"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold">
                      {item.quantity}×
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{item.name}</p>

                      <p className="mt-0.5 text-xs text-zinc-500">
                        {formatMoney(item.price)} each
                      </p>
                    </div>

                    <p className="shrink-0 font-semibold">
                      {formatMoney(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 grid gap-4 border-t border-zinc-100 pt-5 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-zinc-500">Payment</p>

                <p className="mt-1 font-semibold">
                  {order.payment_status}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Placed</p>

                <p className="mt-1 font-semibold">
                  {formatTimeAgo(order.created_at)}
                </p>
              </div>
            </div>
          </div>

          <aside className="border-t border-zinc-100 bg-zinc-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>

              <div className="flex justify-between text-zinc-500">
                <span>Delivery fee</span>
                <span>{formatMoney(order.delivery_fee)}</span>
              </div>

              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-zinc-500">
                  <span>Discount</span>
                  <span>-{formatMoney(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-zinc-200 pt-3 font-bold">
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </div>
            </div>

            {actionError && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {actionError}
              </p>
            )}

            <div className="mt-6 grid gap-2">
              <button
                type="button"
                onClick={handleAccept}
                disabled={accepting || rejecting || items === null}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {accepting && (
                  <LoaderCircle className="size-4 animate-spin" />
                )}
                {accepting ? "Accepting" : "Accept order"}
              </button>

              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                disabled={accepting || rejecting}
                className="h-12 rounded-xl border border-red-200 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reject order
              </button>
            </div>
          </aside>
        </div>
      </article>

      <RejectOrderDialog
        open={rejectOpen}
        loading={rejecting}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
    </>
  );
}