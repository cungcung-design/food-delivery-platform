"use client";

import Link from "next/link";
import { MapPinned, X } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface OrderActionsProps {
  orderId: string;
  canCancel: boolean;
  canTrack: boolean;
  cancelling: boolean;
  error: string;
  onCancel: () => void | Promise<void>;
}

export function OrderActions({
  orderId,
  canCancel,
  canTrack,
  cancelling,
  error,
  onCancel,
}: OrderActionsProps) {
  const [confirming, setConfirming] = useState(false);

  if (!canTrack && !canCancel) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        {canTrack && (
          <Link
            href={`/orders/${orderId}/tracking`}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 font-semibold text-white transition hover:bg-orange-600"
          >
            <MapPinned className="size-4" />
            Track order
          </Link>
        )}

        {canCancel && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={cancelling}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <X className="size-4" />
            Cancel order
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        title="Cancel this order?"
        description="Cancellation is only allowed while the order is pending or confirmed. The backend checks this and will reject the request otherwise."
        confirmLabel="Cancel order"
        destructive
        loading={cancelling}
        onConfirm={() => {
          void Promise.resolve(onCancel()).finally(() => setConfirming(false));
        }}
        onClose={() => {
          if (!cancelling) {
            setConfirming(false);
          }
        }}
      />

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm leading-5 text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
