import { Loader2 } from "lucide-react";

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-72 flex-col items-center justify-center gap-3"
    >
      <Loader2 className="size-7 animate-spin text-orange-500" />

      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  );
}
