"use client";

import Link from "next/link";
import {
  Bell,
  Bike,
  Check,
  ChefHat,
  PackageCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/format";
import type { Notification } from "@/services/notifications";

const icons: Record<string, typeof Bell> = {
  NEW_ORDER: Bell,
  ORDER_CONFIRMED: Check,
  ORDER_REJECTED: Bell,
  ORDER_PREPARING: ChefHat,
  ORDER_READY: PackageCheck,
  DRIVER_ASSIGNED: Bike,
  ORDER_PICKED_UP: Bike,
  OUT_FOR_DELIVERY: Bike,
  ORDER_DELIVERED: Check,
  ORDER_CANCELLED: Bell,
  DISPATCH_SUGGESTED: Bell,
};

interface NotificationItemProps {
  notification: Notification;
  onOpen: (notification: Notification) => void;
}

export function NotificationItem({
  notification,
  onOpen,
}: NotificationItemProps) {
  const Icon = icons[notification.type] ?? Bell;
  const orderId = notification.data?.order_id;
  const isRead = notification.is_read;

  const content = (
    <div
      className={cn(
        "relative flex gap-4 border-b border-zinc-100 p-4 text-left transition last:border-none sm:p-5",
        !isRead && "bg-orange-50/50",
        orderId && "hover:bg-zinc-50",
      )}
    >
      {!isRead && (
        <span className="absolute right-4 top-4 size-2 rounded-full bg-orange-500" />
      )}

      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          isRead
            ? "bg-zinc-100 text-zinc-500"
            : "bg-orange-100 text-orange-600",
        )}
      >
        <Icon className="size-5" />
      </div>

      <div className="min-w-0 flex-1 pr-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={cn("text-sm", isRead ? "font-medium" : "font-bold")}
          >
            {notification.title}
          </h3>

          {!isRead && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
              New
            </span>
          )}
        </div>

        <p className="mt-1 text-sm leading-6 text-zinc-500">
          {notification.message}
        </p>

        <p className="mt-2 text-xs text-zinc-400">
          {formatTimeAgo(notification.created_at)}
        </p>
      </div>
    </div>
  );

  if (!orderId) {
    return (
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className="block w-full"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={`/orders/${orderId}`}
      onClick={() => onOpen(notification)}
      className="block"
    >
      {content}
    </Link>
  );
}
