import { EmptyState } from "@/components/ui/EmptyState";

export default function DriverHistoryPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-orange-500">Driver</p>

      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        Delivery history
      </h1>

      <p className="mt-2 text-sm text-zinc-500">
        Review your completed deliveries.
      </p>

      <div className="mt-8">
        <EmptyState
          title="No delivery history"
          description="Completed deliveries will appear here once the driver API can list them. Nothing is shown until that data exists."
        />
      </div>
    </div>
  );
}
