import { CircleCheck } from "lucide-react";

export function EmptyIncomingOrders() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-green-50">
        <CircleCheck className="size-7 text-green-600" />
      </div>

      <h2 className="mt-5 text-xl font-bold">
        You&apos;re all caught up
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
        New customer orders will appear here when they
        need your attention.
      </p>
    </div>
  );
}