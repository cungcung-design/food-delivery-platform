"use client";

import { AlertTriangle, X } from "lucide-react";

interface ActionConfirmationProps {
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Shown before a destructive request is sent. The backend independently
 * validates cancellation eligibility, so confirming here is a UX gate
 * and not the authorization step.
 */
export function ActionConfirmation({
  title,
  description,
  confirmLabel = "Send request",
  loading,
  onConfirm,
  onCancel,
}: ActionConfirmationProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
          <AlertTriangle className="size-4 text-amber-700" />
        </div>

        <div>
          <h3 className="font-semibold text-zinc-950">{title}</h3>

          <p className="mt-1 text-sm leading-6 text-zinc-600">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : confirmLabel}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-white"
        >
          <X className="size-4" />
          Keep order
        </button>
      </div>
    </div>
  );
}
