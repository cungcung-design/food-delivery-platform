import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this information.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
    >
      <AlertCircle className="mx-auto size-8 text-red-600" />

      <h2 className="mt-3 font-bold text-red-900">{title}</h2>

      <p className="mt-2 text-sm text-red-700">{description}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700"
        >
          <RefreshCw className="size-4" />
          Try again
        </button>
      )}
    </div>
  );
}
