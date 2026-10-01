"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

import { AdminDataProvider, useAdminData } from "@/hooks/useAdminData";
import { PageLoader } from "@/components/ui/PageLoader";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { askOperations } from "@/services/operations";

const SUGGESTIONS = [
  "What needs attention?",
  "Which orders are delayed?",
  "How many active orders are there?",
  "Which restaurants have active orders?",
  "How many drivers are available?",
];

function Operations() {
  const { issues, traces, loading, error, reload } = useAdminData();

  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reply, setReply] = useState("");

  async function handleAsk(event: React.FormEvent) {
    event.preventDefault();

    if (!question.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const report = await askOperations(question.trim());
      setReply(report.reply);
      await reload();
      toast.success("Report updated");
    } catch (askError) {
      toast.error(
        askError instanceof Error
          ? askError.message
          : "Could not answer that.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <PageLoader label="Loading operations report" />;
  }

  if (error) {
    return <ErrorState description={error} onRetry={reload} />;
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleAsk}
        className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
      >
        <h2 className="text-lg font-bold">Ask operations</h2>

        <p className="mt-1 text-sm text-zinc-500">
          This runs read-only tools against live platform data.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuestion(suggestion)}
              className="rounded-full border border-zinc-200 px-3 py-2 text-xs font-medium transition hover:border-orange-300"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about platform operations..."
            className="h-11 flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />

          <button
            type="submit"
            disabled={!question.trim() || submitting}
            aria-label="Run report"
            className="flex w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-40"
          >
            {submitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </button>
        </div>
      </form>

      {reply && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <h2 className="font-bold">Summary</h2>

          <p className="mt-2 text-sm leading-6 text-zinc-700">{reply}</p>
        </section>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold">Orders needing attention</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Stale orders detected by the backend.
        </p>

        {issues.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">
            No orders need attention right now.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {issues.map((issue) => (
              <li key={issue.order_id} className="rounded-xl bg-zinc-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{issue.restaurant}</p>

                  <StatusBadge status={issue.status} />
                </div>

                <p className="mt-1 text-sm text-zinc-600">{issue.reason}</p>

                <p className="mt-2 font-mono text-xs text-zinc-400">
                  {issue.order_id.slice(0, 8).toUpperCase()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {traces.length > 0 && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold">Tool execution</h2>

          <ul className="mt-6 space-y-3">
            {traces.map((trace) => (
              <li
                key={trace.name}
                className="flex items-start justify-between gap-4 rounded-xl bg-zinc-50 p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{trace.name}</p>

                  <p className="mt-1 text-xs text-zinc-500">{trace.detail}</p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                    trace.ok
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {trace.ok ? "OK" : "Failed"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function AdminOperationsPage() {
  return (
    <AdminDataProvider>
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold text-orange-500">Operations</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Delivery operations
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Monitor dispatch and active deliveries.
        </p>

        <div className="mt-8">
          <Operations />
        </div>
      </div>
    </AdminDataProvider>
  );
}