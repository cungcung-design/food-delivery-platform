import { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-zinc-100">
        {icon ?? <Inbox className="size-6 text-zinc-500" />}
      </div>

      <h2 className="mt-4 font-bold">{title}</h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
