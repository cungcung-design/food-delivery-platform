"use client";

import { useState } from "react";
import { toast } from "sonner";

import { AdminDataProvider, useAdminData } from "@/hooks/useAdminData";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";
import { Bot, Loader2, Send, ShieldCheck } from "lucide-react";

import { askOperations, getAIHealth } from "@/services/operations";

const SUGGESTIONS = [
  "How many active orders are there?",
  "Which orders need attention?",
  "Which restaurants have active orders?",
  "How many drivers are available?",
];

function AIPanel() {
  const { traces, loading, error, reload } = useAdminData();

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reply, setReply] = useState("");
  const [aiService, setAiService] = useState("");
  const [healthError, setHealthError] = useState("");

  async function checkHealth() {
    setHealthError("");

    try {
      const health = await getAIHealth();
      setAiService(health.ai_service);
      toast.success(`AI service ${health.ai_service}`);
    } catch (loadError) {
      setHealthError(
        loadError instanceof Error
          ? loadError.message
          : "Could not read AI health.",
      );
    }
  }

  async function handleAsk(event: React.FormEvent) {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const report = await askOperations(message.trim());
      setReply(report.reply);
      await reload();
      toast.success("Report generated");
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
    return <ListSkeleton rows={3} />;
  }

  if (error) {
    return <ErrorState description={error} onRetry={reload} />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <Bot className="size-5 text-orange-600" />
          </div>

          <div>
            <h2 className="font-bold">AI Operations Assistant</h2>

            <p className="text-sm text-zinc-500">
              Analyze platform operations using read-only data.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-bold uppercase text-zinc-400">
            Try asking
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setMessage(suggestion)}
                className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-medium transition hover:border-orange-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAsk} className="mt-5 flex gap-2">
          <textarea
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask about platform operations..."
            className="min-h-24 flex-1 resize-none rounded-xl border border-zinc-200 bg-white p-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />

          <button
            type="submit"
            disabled={!message.trim() || submitting}
            aria-label="Run query"
            className="flex w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-40"
          >
            {submitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </button>
        </form>

        {reply && (
          <div className="mt-6 rounded-xl bg-zinc-50 p-4">
            <p className="text-sm leading-6 text-zinc-700">{reply}</p>
          </div>
        )}
      </section>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold">Service health</h2>

            <ShieldCheck className="size-5 text-green-600" />
          </div>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Read from the live AI service, not a placeholder.
          </p>

          {aiService ? (
            <p className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm font-semibold">
              AI service: {aiService}
            </p>
          ) : (
            <button
              type="button"
              onClick={checkHealth}
              className="mt-4 h-11 w-full rounded-xl border border-zinc-200 text-sm font-semibold transition hover:bg-zinc-50"
            >
              Check AI health
            </button>
          )}

          {healthError && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {healthError}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <h2 className="font-bold">Tools used</h2>

          <p className="mt-1 text-sm text-zinc-500">
            The last report only ran these read-only tools.
          </p>

          {traces.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No activity yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {traces.map((trace) => (
                <li
                  key={trace.name}
                  className="rounded-xl bg-zinc-50 p-3 text-sm"
                >
                  <p className="font-semibold">{trace.name}</p>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    {trace.detail}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}

export default function AdminAIPage() {
  return (
    <AdminDataProvider>
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold text-orange-500">Operations</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          AI Operations
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Analyze operational data using the AI assistant.
        </p>

        <div className="mt-8">
          <AIPanel />
        </div>
      </div>
    </AdminDataProvider>
  );
}
