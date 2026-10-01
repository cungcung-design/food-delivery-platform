"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Bike,
  CirclePause,
  CirclePower,
  Loader2,
  MapPin,
} from "lucide-react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  useDriverDashboard,
  type DriverStatus,
} from "@/hooks/useDriverDashboard";

const STATUS_CONFIG: Record<
  DriverStatus | "BUSY",
  { label: string; description: string; dot: string; badge: string }
> = {
  OFFLINE: {
    label: "You're offline",
    description:
      "Go online when you're ready to receive delivery assignments.",
    dot: "bg-zinc-400",
    badge: "bg-zinc-100 text-zinc-600",
  },
  AVAILABLE: {
    label: "You're online",
    description:
      "You're available to receive delivery assignments.",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700",
  },
  BUSY: {
    label: "Delivery in progress",
    description: "You're currently completing an assigned delivery.",
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700",
  },
  PAUSED: {
    label: "You're paused",
    description: "You won't receive new assignments while paused.",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
  },
};

/**
 * The status is always read back from `GET /api/driver/me` after a successful
 * PATCH. BUSY is rendered but never offered as a choice: the backend sets it
 * when a delivery is assigned and rejects any manual attempt to set it.
 */
export function DriverAvailability() {
  const { driver, changeStatus, loading } = useDriverDashboard();

  const [updating, setUpdating] = useState<DriverStatus | null>(null);
  const [offlineOpen, setOfflineOpen] = useState(false);

  if (!driver) {
    return null;
  }

  const status = (driver.status as DriverStatus | "BUSY") ?? "OFFLINE";
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.OFFLINE;

  async function updateStatus(next: DriverStatus) {
    setUpdating(next);

    try {
      await changeStatus(next);
      setOfflineOpen(false);
      toast.success(
        next === "AVAILABLE"
          ? "You're online"
          : next === "PAUSED"
            ? "Deliveries paused"
            : "You're offline",
      );
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update your status",
      );
    } finally {
      setUpdating(null);
    }
  }

  function buttonClass(
    disabled: boolean,
    variant: "primary" | "ghost" | "danger",
  ) {
    if (variant === "primary") {
      return `flex h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 text-sm font-bold text-white transition hover:bg-green-700 ${
        disabled ? "opacity-50" : ""
      }`;
    }

    if (variant === "danger") {
      return `h-11 rounded-xl text-sm font-semibold text-red-600 transition hover:bg-red-50 ${
        disabled ? "opacity-50" : ""
      }`;
    }

    return `flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 text-sm font-semibold transition hover:bg-zinc-50 ${
      disabled ? "opacity-50" : ""
    }`;
  }

  const busy = updating !== null || loading;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className={`size-3 rounded-full ${config.dot}`} />

            <h2 className="text-lg font-bold">{config.label}</h2>
          </div>

          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
            {config.description}
          </p>

          <span
            className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${config.badge}`}
          >
            {status}
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:min-w-44">
          {status === "OFFLINE" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => updateStatus("AVAILABLE")}
              className={buttonClass(busy, "primary")}
            >
              {updating === "AVAILABLE" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CirclePower className="size-5" />
              )}

              Go online
            </button>
          )}

          {status === "AVAILABLE" && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => updateStatus("PAUSED")}
                className={buttonClass(busy, "ghost")}
              >
                {updating === "PAUSED" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CirclePause className="size-4" />
                )}

                Pause
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => setOfflineOpen(true)}
                className={buttonClass(busy, "danger")}
              >
                Go offline
              </button>
            </>
          )}

          {status === "PAUSED" && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => updateStatus("AVAILABLE")}
                className={buttonClass(busy, "primary")}
              >
                {updating === "AVAILABLE" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Bike className="size-4" />
                )}

                Resume deliveries
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => setOfflineOpen(true)}
                className={buttonClass(busy, "danger")}
              >
                Go offline
              </button>
            </>
          )}

          {status === "BUSY" && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-center text-sm font-semibold text-orange-700">
              <MapPin className="size-4" />
              Complete current delivery
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={offlineOpen}
        title="Go offline?"
        description="You will stop receiving new delivery assignments until you go online again."
        confirmLabel="Go offline"
        destructive
        loading={updating === "OFFLINE"}
        onConfirm={() => updateStatus("OFFLINE")}
        onClose={() => {
          if (updating !== "OFFLINE") {
            setOfflineOpen(false);
          }
        }}
      />
    </section>
  );
}