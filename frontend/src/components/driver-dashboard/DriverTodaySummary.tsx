"use client";

import { Bike, CircleDollarSign, Clock3, Info } from "lucide-react";

import { useDriverDashboard } from "@/hooks/useDriverDashboard";

/**
 * The driver API exposes no daily aggregates: `/api/driver/deliveries` returns
 * only the active delivery or the dispatchable queue, and there is no
 * compensation or online-time endpoint. Rather than render invented numbers,
 * this panel shows the values the API does return and states plainly which
 * figures are not yet available.
 */
export function DriverTodaySummary() {
  const { driver, activeDelivery, openDeliveries } = useDriverDashboard();

  const stats = [
    {
      label: "Deliveries",
      value: activeDelivery ? "1 active" : "None",
      icon: Bike,
    },
    {
      label: "Earnings",
      value: "Not available",
      icon: CircleDollarSign,
    },
    {
      label: "Open queue",
      value: String(openDeliveries.length),
      icon: Clock3,
    },
  ];

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold">Today</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Your delivery activity for today.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <article
            key={label}
            className="rounded-2xl border border-zinc-200 bg-white p-5"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange-50">
              <Icon className="size-5 text-orange-500" />
            </div>

            <p className="mt-4 text-sm text-zinc-500">{label}</p>

            <p className="mt-1 text-xl font-bold">{value}</p>
          </article>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-zinc-100 p-4 text-sm leading-6 text-zinc-600">
        <Info className="mt-0.5 size-4 shrink-0" />

        Completed-delivery counts, earnings, and online time have no API yet, so
        they are left out instead of being estimated.

        {driver?.vehicle_number && (
          <span className="sr-only">
            Vehicle {driver.vehicle_number}
          </span>
        )}
      </p>
    </section>
  );
}