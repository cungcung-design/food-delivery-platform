import { EmptyState } from "@/components/ui/EmptyState";

export default function DriverEarningsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-orange-500">Driver</p>

      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        Earnings
      </h1>

      <p className="mt-2 text-sm text-zinc-500">
        Track your delivery activity and earnings.
      </p>

      <div className="mt-8">
        <EmptyState
          title="No earnings yet"
          description="Driver pay is not stored or calculated yet, so this page stays empty instead of showing estimated amounts."
        />
      </div>
    </div>
  );
}
