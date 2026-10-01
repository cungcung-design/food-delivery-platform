"use client";

import { Bell, Bike, Menu } from "lucide-react";
import Link from "next/link";

import { useDriverDashboard } from "@/hooks/useDriverDashboard";

const DRIVER_STATUS_STYLES: Record<string, { dot: string; label: string }> =
  {
    OFFLINE: { dot: "bg-zinc-400", label: "Offline" },
    AVAILABLE: { dot: "bg-green-500", label: "Available" },
    PAUSED: { dot: "bg-amber-500", label: "Paused" },
    BUSY: { dot: "bg-orange-500", label: "On a delivery" },
  };

export function DriverHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const { driver } = useDriverDashboard();

  const status = driver
    ? DRIVER_STATUS_STYLES[driver.status] ?? {
        dot: "bg-zinc-300",
        label: driver.status,
      }
    : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:h-20">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open navigation"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-zinc-100 lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold sm:text-base">Driver</p>

          <div className="mt-0.5 flex items-center gap-1.5">
            <span
              className={`size-2 shrink-0 rounded-full ${
                status?.dot ?? "bg-zinc-300"
              }`}
            />

            <span className="truncate text-xs text-zinc-500">
              {status?.label ?? "Loading"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="flex size-10 items-center justify-center rounded-xl hover:bg-zinc-100"
        >
          <Bell className="size-5 text-zinc-600" />
        </Link>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex size-9 items-center justify-center rounded-full bg-orange-100">
            <Bike className="size-4 text-orange-600" />
          </div>

          <div className="text-left">
            <p className="text-sm font-semibold">Courier</p>

            <p className="text-xs text-zinc-500">
              {driver?.vehicle_number ?? "No vehicle"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}