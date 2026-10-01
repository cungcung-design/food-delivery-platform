"use client";

import { AdminDataProvider, useAdminData } from "@/hooks/useAdminData";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock3,
} from "lucide-react";

function Overview() {
  const { issues, traces, aiService, loading, error, reload } = useAdminData();

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StatSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState description={error} onRetry={reload} />;
  }

  const stats = [
    {
      label: "Orders needing attention",
      value: String(issues.length),
      icon: AlertTriangle,
    },
    {
      label: "Read-only tools run",
      value: String(traces.length),
      icon: CheckCircle2,
    },
    {
      label: "Tools that succeeded",
      value: String(traces.filter((trace) => trace.ok).length),
      icon: Clock3,
    },
    {
      label: "AI service",
      value: aiService ?? "unknown",
      icon: Bot,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <article
            key={label}
            className="rounded-2xl border border-zinc-200 bg-white p-5"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange-50">
              <Icon className="size-5 text-orange-500" />
            </div>

            <p className="mt-4 text-sm text-zinc-500">{label}</p>

            <p className="mt-1 break-words text-2xl font-bold">{value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold">Live operations</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Orders the backend currently flags for attention.
          </p>

          {issues.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">
              No orders need attention right now.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {issues.slice(0, 6).map((issue) => (
                <li
                  key={issue.order_id}
                  className="rounded-xl bg-zinc-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{issue.restaurant}</p>

                    <StatusBadge status={issue.status} />
                  </div>

                  <p className="mt-1 text-sm text-zinc-600">{issue.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold">Tool execution</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Read-only tools the operations report ran.
          </p>

          {traces.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">
              No tool activity was reported.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {traces.map((trace) => (
                <div
                  key={trace.name}
                  className="flex items-start gap-3 rounded-xl bg-zinc-50 p-4"
                >
                  <CheckCircle2
                    className={`mt-0.5 size-4 shrink-0 ${
                      trace.ok ? "text-green-600" : "text-red-600"
                    }`}
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{trace.name}</p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {trace.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminDataProvider>
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold text-orange-500">Operations</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Platform overview
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Monitor activity across the food delivery platform.
        </p>

        <div className="mt-8">
          <Overview />
        </div>
      </div>
    </AdminDataProvider>
  );
}
