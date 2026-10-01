"use client";

import { LoaderCircle } from "lucide-react";

interface RejectOrderDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RejectOrderDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: RejectOrderDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-order-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="reject-order-title" className="text-xl font-bold">
          Reject this order?
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          The customer is notified that the restaurant cannot
          accept this order. This cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-11 rounded-xl px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50"
          >
            Keep order
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            {loading ? "Rejecting" : "Reject order"}
          </button>
        </div>
      </div>
    </div>
  );
}