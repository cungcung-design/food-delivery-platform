"use client";

import {
  getNotifications,
  markAllRead,
  markNotificationRead,
  type Notification,
} from "@/services/notifications";
import { useCallback, useEffect, useState } from "react";

import { NotificationItem } from "./NotificationItem";
import { EmptyNotifications } from "./EmptyNotifications";

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const data = await getNotifications();
    setNotifications(data.notifications ?? []);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
        .catch((loadError) => {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load notifications.",
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  async function handleOpen(notification: Notification) {
    if (notification.is_read) {
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item,
      ),
    );

    try {
      await markNotificationRead(notification.id);
    } catch (markError) {
      setError(
        markError instanceof Error
          ? markError.message
          : "Could not update notification.",
      );
      await load().catch(() => undefined);
    }
  }

  async function handleMarkAllRead() {
    setError("");

    setNotifications((current) =>
      current.map((item) => ({ ...item, is_read: true })),
    );

    try {
      await markAllRead();
    } catch (readError) {
      setError(
        readError instanceof Error
          ? readError.message
          : "Could not update notifications.",
      );
      await load().catch(() => undefined);
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">
          {loading
            ? "Loading..."
            : unreadCount === 0
              ? "You're all caught up."
              : `${unreadCount} unread notification${
                  unreadCount === 1 ? "" : "s"
                }`}
        </p>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-sm font-semibold text-orange-600 transition hover:text-orange-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && notifications.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <EmptyNotifications />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onOpen={handleOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
