"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, LocateFixed, MapPin, Play, Square } from "lucide-react";

import { useDriverDashboard } from "@/hooks/useDriverDashboard";
import {
  getTracking,
  trackingStreamUrl,
  type Tracking,
} from "@/services/orders";
import { LocationSharingStatus } from "./LocationSharingStatus";

interface DriverTrackingPanelProps {
  orderId: string;
}

/** Posts browser GPS to the backend on an interval while sharing is on. */
const SHARE_INTERVAL_MS = 15000;

export function DriverTrackingPanel({ orderId }: DriverTrackingPanelProps) {
  const { shareLocation, driver } = useDriverDashboard();

  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [streamConnected, setStreamConnected] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [lastSharedAt, setLastSharedAt] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const lastSentRef = useRef(0);

  const sendLocation = useCallback(
    (latitude: number, longitude: number) => {
      void shareLocation(latitude, longitude)
        .then(() => setLastSharedAt(new Date().toISOString()))
        .catch((shareError) => {
          setError(
            shareError instanceof Error
              ? shareError.message
              : "Could not share your location.",
          );
        });
    },
    [shareLocation],
  );

  // Initial snapshot, then live updates over the same SSE stream the
  // customer tracking screen uses.
  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      void getTracking(orderId)
        .then((data) => {
          if (!cancelled) {
            setTracking(data.tracking);
          }
        })
        .catch((loadError) => {
          if (!cancelled) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : "Could not load tracking.",
            );
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [orderId]);

  useEffect(() => {
    const source = new EventSource(trackingStreamUrl(orderId));

    const handleTracking = (event: MessageEvent<string>) => {
      try {
        setTracking(JSON.parse(event.data) as Tracking);
        setStreamConnected(true);
      } catch {
        // Ignore malformed frames rather than tearing down the stream.
      }
    };

    source.addEventListener("tracking", handleTracking as EventListener);
    source.onopen = () => setStreamConnected(true);
    source.onerror = () => setStreamConnected(false);

    return () => {
      source.removeEventListener("tracking", handleTracking as EventListener);
      source.close();
    };
  }, [orderId]);

  function startSharing() {
    if (!("geolocation" in navigator)) {
      setError("This browser does not support location sharing.");
      return;
    }

    setError("");
    setPending(true);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setPending(false);
        setSharing(true);

        const now = Date.now();

        // Throttle so a fast-moving GPS does not flood the API.
        if (now - lastSentRef.current >= SHARE_INTERVAL_MS) {
          lastSentRef.current = now;
          sendLocation(position.coords.latitude, position.coords.longitude);
        }
      },
      (geoError) => {
        setPending(false);
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission was denied."
            : "Could not read your location.",
        );
      },
      { enableHighAccuracy: true },
    );

    setWatchId(id);
  }

  function stopSharing() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    setSharing(false);
  }

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const latitude = tracking?.latitude ?? driver?.latitude ?? null;
  const longitude = tracking?.longitude ?? driver?.longitude ?? null;

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <h2 className="font-bold">Live delivery tracking</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Your location is shared during the active delivery.
          </p>
        </div>

        <LocationSharingStatus
          connected={streamConnected}
          sharing={sharing}
          lastSharedAt={lastSharedAt}
        />
      </div>

      {error && (
        <p className="mx-5 mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 sm:mx-6">
          {error}
        </p>
      )}

      <div className="flex flex-col items-center justify-center gap-4 bg-zinc-100 px-5 py-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-white shadow-sm">
          <MapPin className="size-6 text-orange-500" />
        </div>

        {latitude != null && longitude != null ? (
          <div>
            <p className="text-sm font-semibold">
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Last position recorded by the server.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold">No position recorded</p>

            <p className="mt-1 text-xs text-zinc-500">
              Start sharing to send your live location.
            </p>
          </div>
        )}

        {sharing ? (
          <button
            type="button"
            onClick={stopSharing}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-700 shadow-sm"
          >
            <Square className="size-4" />
            Stop sharing
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={startSharing}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LocateFixed className="size-4" />
            )}

            {pending ? "Requesting..." : "Share my location"}
          </button>
        )}

        <p className="flex items-center gap-2 text-xs text-zinc-500">
          <Play className="size-3" />
          Location is only sent while you keep sharing turned on.
        </p>
      </div>
    </section>
  );
}