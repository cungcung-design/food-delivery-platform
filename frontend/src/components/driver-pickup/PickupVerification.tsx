import { CheckCircle2, PackageCheck } from "lucide-react";

interface PickupVerificationProps {
  orderReference: string;
  itemCount: number | null;
  restaurantName: string;
}

export function PickupVerification({
  orderReference,
  itemCount,
  restaurantName,
}: PickupVerificationProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-50">
          <PackageCheck className="size-5 text-orange-600" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
            Pickup verification
          </p>

          <h2 className="font-bold">Check the order</h2>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-4">
          <span className="text-sm text-zinc-500">Order</span>

          <span className="font-bold">#{orderReference}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-4">
          <span className="text-sm text-zinc-500">Restaurant</span>

          <span className="text-right text-sm font-semibold">
            {restaurantName}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-4">
          <span className="text-sm text-zinc-500">Items</span>

          <span className="font-semibold">
            {itemCount ?? "Unavailable"}
          </span>
        </div>
      </div>

      <div className="mt-5 flex gap-3 rounded-xl bg-green-50 p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />

        <p className="text-sm leading-6 text-green-800">
          Confirm the order reference and package with the restaurant before
          marking the order as picked up.
        </p>
      </div>
    </section>
  );
}