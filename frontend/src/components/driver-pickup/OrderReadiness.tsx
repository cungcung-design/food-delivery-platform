import { CheckCircle2, Clock3, CookingPot } from "lucide-react";

interface OrderReadinessProps {
  /** Order status straight from the order/delivery payload. */
  orderStatus: string;
}

/**
 * Readiness is read from the order status only. The driver cannot override
 * restaurant preparation state, and the delivery can only be picked up once
 * the backend accepts the transition.
 */
export function OrderReadiness({ orderStatus }: OrderReadinessProps) {
  // DRIVER_ASSIGNED means the order was READY when it was dispatched.
  const ready = orderStatus === "READY" || orderStatus === "DRIVER_ASSIGNED";

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="font-bold">Order readiness</h2>

      {ready ? (
        <div className="mt-5 flex gap-4 rounded-xl bg-green-50 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="size-5 text-green-600" />
          </div>

          <div>
            <p className="font-bold text-green-800">Order is ready</p>

            <p className="mt-1 text-sm leading-6 text-green-700">
              Collect the package from the restaurant and verify the order
              reference before confirming pickup.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex gap-4 rounded-xl bg-amber-50 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <CookingPot className="size-5 text-amber-600" />
          </div>

          <div>
            <p className="font-bold text-amber-800">
              Restaurant is preparing the order
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              Wait for the restaurant to mark the order as ready before
              collecting it.
            </p>
          </div>
        </div>
      )}

      {!ready && (
        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
          <Clock3 className="size-4" />
          Waiting for restaurant (current status: {orderStatus})
        </div>
      )}
    </section>
  );
}