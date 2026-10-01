import {
  Check,
  ChefHat,
  CircleCheck,
  PackageCheck,
  Truck,
} from "lucide-react";

import { cn } from "@/lib/utils";

const FLOW = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DRIVER_ASSIGNED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

const steps = [
  { status: "CONFIRMED", label: "Confirmed", icon: Check },
  { status: "PREPARING", label: "Preparing", icon: ChefHat },
  { status: "READY", label: "Ready", icon: PackageCheck },
  { status: "OUT_FOR_DELIVERY", label: "On the way", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: CircleCheck },
] as const;

interface OrderStatusTimelineProps {
  status: string;
}

export function OrderStatusTimeline({
  status,
}: OrderStatusTimelineProps) {
  const currentIndex = FLOW.indexOf(
    status as (typeof FLOW)[number],
  );

  const stopped =
    status === "CANCELLED" || status === "REJECTED" || currentIndex === -1;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold">Order status</h2>

      {stopped ? (
        <p className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
          This order will not progress any further. See the status badge
          above for the final outcome.
        </p>
      ) : (
        <div className="mt-7">
          {steps.map((step, index) => {
            const stepIndex = FLOW.indexOf(step.status);
            const completed = currentIndex >= stepIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.status}
                className="relative flex gap-4 pb-8 last:pb-0"
              >
                {index !== steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-[19px] top-10 h-[calc(100%-24px)] w-0.5",
                      completed ? "bg-orange-500" : "bg-zinc-200",
                    )}
                  />
                )}

                <div
                  className={cn(
                    "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full",
                    completed
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-100 text-zinc-400",
                  )}
                >
                  <Icon className="size-4" />
                </div>

                <div className="pt-2">
                  <p
                    className={
                      completed
                        ? "font-semibold text-zinc-950"
                        : "font-medium text-zinc-400"
                    }
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
