import { Check, Circle, Store, Bike, MapPin } from "lucide-react";

export type DeliveryStage =
  | "ASSIGNED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

interface DeliveryProgressProps {
  status: string;
}

const STEPS = [
  { status: "ASSIGNED", label: "Assigned", icon: Store },
  { status: "PICKED_UP", label: "Picked up", icon: Bike },
  { status: "OUT_FOR_DELIVERY", label: "On the way", icon: MapPin },
  { status: "DELIVERED", label: "Delivered", icon: Check },
] as const;

export function DeliveryProgress({ status }: DeliveryProgressProps) {
  // An unknown or terminal-further state falls back to the first step rather
  // than rendering every step as incomplete.
  const currentIndex = Math.max(
    STEPS.findIndex((step) => step.status === status),
    0,
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="font-bold">Delivery progress</h2>

      <div className="mt-6 grid grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const complete = index <= currentIndex;

          return (
            <div
              key={step.status}
              className="relative flex flex-col items-center text-center"
            >
              {index < STEPS.length - 1 && (
                <div
                  className={`absolute left-1/2 top-5 h-0.5 w-full ${
                    index < currentIndex ? "bg-orange-500" : "bg-zinc-200"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex size-10 items-center justify-center rounded-full ${
                  complete
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-100 text-zinc-400"
                }`}
              >
                {complete ? (
                  <Icon className="size-4" />
                ) : (
                  <Circle className="size-4" />
                )}
              </div>

              <p
                className={`mt-2 text-[11px] font-semibold sm:text-xs ${
                  complete ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}