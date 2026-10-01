import { Bike } from "lucide-react";

export function EmptyAssignments() {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-orange-50">
        <Bike className="size-7 text-orange-500" />
      </div>

      <h2 className="mt-5 text-xl font-bold">No active deliveries</h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
        When a delivery is assigned to you, or you go online and the dispatch
        queue has work, it will appear here.
      </p>
    </div>
  );
}