import { PackageSearch } from "lucide-react";

export function OrdersEmptyState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-zinc-100">
        <PackageSearch className="size-7 text-zinc-500" />
      </div>

      <h2 className="mt-5 text-xl font-bold">No orders found</h2>

      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        There are no orders matching your current search or
        status filter.
      </p>
    </div>
  );
}