export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-zinc-200 ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <LoadingSkeleton className="h-40 w-full" />

      <LoadingSkeleton className="mt-4 h-5 w-2/3" />
      <LoadingSkeleton className="mt-2 h-4 w-full" />
      <LoadingSkeleton className="mt-2 h-4 w-1/2" />
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-zinc-200 bg-white p-5"
        >
          <LoadingSkeleton className="h-5 w-1/3" />
          <LoadingSkeleton className="mt-3 h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <LoadingSkeleton className="size-10 rounded-xl" />
      <LoadingSkeleton className="mt-4 h-4 w-1/2" />
      <LoadingSkeleton className="mt-2 h-6 w-2/3" />
    </div>
  );
}
