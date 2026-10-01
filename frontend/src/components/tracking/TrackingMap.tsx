import { MapPin, Navigation, Store } from "lucide-react";

import type { Tracking } from "@/services/orders";
import { formatTime } from "@/lib/format";

interface TrackingMapProps {
  tracking: Tracking | null;
  lastUpdatedAt: string | null;
}

type Point = { x: number; y: number };

/**
 * The tracking endpoint exposes coordinates and a short location history,
 * but no map provider is configured in this project yet. Rather than
 * render a decorative placeholder, this plots the real coordinates the
 * backend returned on a normalised SVG canvas.
 */
export function TrackingMap({
  tracking,
  lastUpdatedAt,
}: TrackingMapProps) {
  const pickup =
    tracking?.pickup_latitude != null &&
    tracking?.pickup_longitude != null
      ? {
          lat: tracking.pickup_latitude,
          lng: tracking.pickup_longitude,
        }
      : null;

  const dropoff =
    tracking?.dropoff_latitude != null &&
    tracking?.dropoff_longitude != null
      ? {
          lat: tracking.dropoff_latitude,
          lng: tracking.dropoff_longitude,
        }
      : null;

  const driver =
    tracking?.latitude != null && tracking?.longitude != null
      ? { lat: tracking.latitude, lng: tracking.longitude }
      : null;

  const coords = [
    ...tracking?.points.map((point) => ({
      lat: point.latitude,
      lng: point.longitude,
    })) ?? [],
    ...(driver ? [driver] : []),
    ...(pickup ? [pickup] : []),
    ...(dropoff ? [dropoff] : []),
  ];

  const project = (values: { lat: number; lng: number }[]): Point[] => {
    if (values.length === 0) {
      return [];
    }

    const lats = values.map((value) => value.lat);
    const lngs = values.map((value) => value.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const spanLat = maxLat - minLat || 0.0001;
    const spanLng = maxLng - minLng || 0.0001;

    return values.map((value) => ({
      x: 40 + ((value.lng - minLng) / spanLng) * 520,
      y: 400 - ((value.lat - minLat) / spanLat) * 360,
    }));
  };

  const projected = project(coords);
  const offset = projected.length - coords.length;

  const driverPoint = driver ? projected[offset] : null;
  const pickupPoint = pickup ? projected[offset + 1] : null;
  const dropoffPoint = dropoff ? projected[offset + 2] : null;
  const trail = projected.slice(0, offset);

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 lg:min-h-[620px]">
      {coords.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-6 text-center">
            <MapPin className="mx-auto size-8 text-zinc-400" />

            <p className="mt-3 text-sm font-medium text-zinc-500">
              No location data yet
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Coordinates appear once the restaurant or driver shares
              a location.
            </p>
          </div>
        </div>
      ) : (
        <svg
          viewBox="0 0 600 440"
          className="absolute inset-0 size-full"
          role="img"
          aria-label="Delivery route with driver location"
        >
          {trail.length > 1 && (
            <polyline
              points={trail
                .map((point) => `${point.x},${point.y}`)
                .join(" ")}
              fill="none"
              stroke="var(--color-orange-500)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 6"
            />
          )}

          {pickupPoint && (
            <g>
              <circle
                cx={pickupPoint.x}
                cy={pickupPoint.y}
                r={9}
                fill="white"
                stroke="var(--color-zinc-400)"
                strokeWidth={3}
              />
              <text
                x={pickupPoint.x}
                y={pickupPoint.y - 18}
                textAnchor="middle"
                className="fill-zinc-500 text-[13px] font-semibold"
              >
                Restaurant
              </text>
            </g>
          )}

          {dropoffPoint && (
            <g>
              <circle
                cx={dropoffPoint.x}
                cy={dropoffPoint.y}
                r={9}
                fill="var(--color-orange-500)"
              />
              <text
                x={dropoffPoint.x}
                y={dropoffPoint.y + 24}
                textAnchor="middle"
                className="fill-zinc-500 text-[13px] font-semibold"
              >
                You
              </text>
            </g>
          )}

          {driverPoint && (
            <g>
              <circle
                cx={driverPoint.x}
                cy={driverPoint.y}
                r={16}
                fill="var(--color-orange-500)"
                opacity={0.2}
              />
              <circle
                cx={driverPoint.x}
                cy={driverPoint.y}
                r={8}
                fill="var(--color-orange-500)"
                stroke="white"
                strokeWidth={3}
              />
              <text
                x={driverPoint.x}
                y={driverPoint.y - 26}
                textAnchor="middle"
                className="fill-zinc-900 text-[13px] font-semibold"
              >
                Driver
              </text>
            </g>
          )}
        </svg>
      )}

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
        <Store className="size-4 text-orange-500" />

        <span className="text-xs font-semibold">Restaurant</span>
      </div>

      {driver && (
        <div className="absolute bottom-4 left-4 rounded-xl bg-zinc-950 px-4 py-3 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <Navigation className="size-4 text-orange-400" />

            <div>
              <p className="text-xs font-semibold">Driver location</p>

              <p className="mt-0.5 text-xs text-zinc-400">
                {driver.lat.toFixed(5)}, {driver.lng.toFixed(5)}
                {lastUpdatedAt
                  ? ` • ${formatTime(lastUpdatedAt)}`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
