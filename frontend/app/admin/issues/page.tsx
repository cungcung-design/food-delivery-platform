"use client";

import { useEffect, useState } from "react";

import { AdminDataProvider, useAdminData } from "@/hooks/useAdminData";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getDispatchRecommendations, type Recommendation } from "@/services/operations";

function IssuesAndDispatch() {
  const { issues, loading, error, reload } = useAdminData();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [dispatchError, setDispatchError] = useState("");

  async function loadDispatch() {
    setDispatchError("");

    try {
      const data = await getDispatchRecommendations();
      setRecommendations(data.recommendations ?? []);
    } catch (loadError) {
      setDispatchError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load dispatch suggestions.",
      );
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDispatch();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (loading) {
    return <ListSkeleton rows={4} />;
  }

  if (error) {
    return <ErrorState description={error} onRetry={reload} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold">Orders needing attention</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Detected by the backend operations report.
        </p>

        {issues.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">
            No issues are currently open.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {issues.map((issue) => (
              <li
                key={issue.order_id}
                className="rounded-xl border border-zinc-100 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{issue.restaurant}</p>

                  <div className="flex items-center gap-2">
                    {issue.delivery_status && (
                      <StatusBadge status={issue.delivery_status} />
                    )}

                    <StatusBadge status={issue.status} />
                  </div>
                </div>

                <p className="mt-2 text-sm text-zinc-600">{issue.reason}</p>

                <p className="mt-2 font-mono text-xs text-zinc-400">
                  {issue.order_id.slice(0, 8).toUpperCase()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold">Dispatch suggestions</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Recorded driver recommendations for orders awaiting a driver.
        </p>

        {dispatchError ? (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {dispatchError}
          </p>
        ) : recommendations.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">
            No dispatch suggestions have been generated.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {recommendations.map((item) => (
              <li key={item.id} className="rounded-xl bg-zinc-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-sm font-semibold">
                    {item.order_id.slice(0, 8).toUpperCase()}
                  </p>

                  {item.distance_km != null && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-zinc-600">
                      {item.distance_km.toFixed(1)} km
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-zinc-600">{item.reason}</p>

                <p className="mt-2 text-xs text-zinc-400">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function AdminIssuesPage() {
  return (
    <AdminDataProvider>
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold text-orange-500">Operations</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Issues and dispatch
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Stalled orders and recorded driver suggestions.
        </p>

        <div className="mt-8">
          <IssuesAndDispatch />
        </div>
      </div>
    </AdminDataProvider>
  );
}
