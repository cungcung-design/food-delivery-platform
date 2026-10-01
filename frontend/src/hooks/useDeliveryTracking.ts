"use client";

import { useEffect, useState } from "react";

import { trackingStreamUrl, type Tracking } from "@/services/orders";

export type ConnectionState =
  | "connecting"
  | "live"
  | "reconnecting"
  | "offline";

export interface DeliveryTracking {
  tracking: Tracking | null;
  connectionState: ConnectionState;
  lastUpdatedAt: string | null;
}

/**
 * Consumes the existing server-sent event stream at
 * GET /api/orders/:id/tracking/stream. Authentication rides on the
 * session cookie, so no token is placed in the URL.
 */
export function useDeliveryTracking(
  orderId: string | undefined,
): DeliveryTracking {
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const source = new EventSource(trackingStreamUrl(orderId), {
      withCredentials: true,
    });

    source.onopen = () => {
      setConnectionState("live");
    };

    source.addEventListener("tracking", (event) => {
      try {
        setTracking(JSON.parse((event as MessageEvent).data) as Tracking);
        setLastUpdatedAt(new Date().toISOString());
        setConnectionState("live");
      } catch {
        // Ignore malformed stream payloads.
      }
    });

    source.addEventListener("ping", () => {
      setConnectionState("live");
    });

    source.onerror = () => {
      setConnectionState(
        typeof navigator !== "undefined" && !navigator.onLine
          ? "offline"
          : "reconnecting",
      );
    };

    const handleOnline = () => {
      setConnectionState("reconnecting");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOnline);
      source.close();
    };
  }, [orderId]);

  return { tracking, connectionState, lastUpdatedAt };
}
