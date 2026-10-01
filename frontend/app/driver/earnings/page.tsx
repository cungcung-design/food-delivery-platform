"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { formatMoney } from "@/lib/format";
import {
  getDriverEarnings,
  type DriverEarnings,
} from "@/services/driver";

const emptyEarnings: DriverEarnings = {
  completed_count: 0,
  total: "0.00",
  today_count: 0,
  today_total: "0.00",
};

export default function DriverEarningsPage() {
  const [earnings, setEarnings] = useState<DriverEarnings>(emptyEarnings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let stop = false;

    getDriverEarnings()
      .then((data) => {
        if (!stop) {
          setEarnings(data.earnings ?? emptyEarnings);
        }
      })
      .catch((loadError) => {
        if (!stop) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load earnings.",
          );
        }
      })
      .finally(() => {
        if (!stop) {
          setLoading(false);
        }
      });

    return () => {
      stop = true;
    };
  }, []);

  const cards = [
    {
      label: "Completed deliveries",
      value: String(earnings.completed_count),
      description: "Deliveries you have finished",
    },
    {
      label: "Total earnings",
      value: formatMoney(earnings.total),
      description: "Delivery fees from completed orders",
    },
    {
      label: "Today's deliveries",
      value: String(earnings.today_count),
      description: "Finished today",
    },
    {
      label: "Today's earnings",
      value: formatMoney(earnings.today_total),
      description: "Delivery fees earned today",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-orange-500">Driver</p>

      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        Earnings
      </h1>

      <p className="mt-2 text-sm text-zinc-500">
        Track your delivery activity and earnings.
      </p>

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading earnings...</p>
        ) : error ? (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : earnings.completed_count === 0 ? (
          <EmptyState
            title="No earnings yet"
            description="Your delivery fees will appear here after you complete a delivery."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <article
                key={card.label}
                className="rounded-2xl border border-zinc-200 bg-white p-5"
              >
                <p className="text-sm font-medium text-zinc-500">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  {card.value}
                </p>
                <p className="mt-4 text-xs text-zinc-400">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
