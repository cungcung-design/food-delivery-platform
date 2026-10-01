import { Banknote, ShieldCheck } from "lucide-react";

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: "Payment pending",
  PAID: "Paid",
  FAILED: "Payment failed",
  REFUNDED: "Refunded",
};

interface PaymentMethodProps {
  /**
   * Backend payment_status for the order. Checkout does not accept a
   * payment method from the browser, so this panel is read-only.
   */
  paymentStatus?: string;
}

/**
 * The checkout endpoint only receives an address_id. It does not accept a
 * payment method, so no selector is rendered here. Capturing payment is a
 * backend concern; this component only reflects the stored status.
 */
export function PaymentMethod({
  paymentStatus,
}: PaymentMethodProps) {
  const label = paymentStatus
    ? (PAYMENT_LABELS[paymentStatus] ?? paymentStatus)
    : "Pay on delivery";

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold">Payment</h2>

      <p className="mt-1 text-sm text-zinc-500">
        Payment is confirmed by the platform once your order is placed.
      </p>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white">
          <Banknote className="size-5 text-orange-500" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold">{label}</p>

          <p className="mt-1 text-sm leading-5 text-zinc-500">
            {paymentStatus
              ? "This is the status recorded for this order."
              : "Your order is recorded as unpaid until it is settled."}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
        <ShieldCheck className="size-3.5" />
        Amounts are calculated and validated by the backend
      </div>
    </section>
  );
}
