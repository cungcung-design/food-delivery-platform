import { Bot } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SupportTrace } from "@/services/support";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  traces?: SupportTrace[];
}

export function ChatMessage({
  role,
  content,
  traces,
}: ChatMessageProps) {
  const user = role === "user";

  return (
    <div className={cn("flex gap-3", user && "justify-end")}>
      {!user && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-100">
          <Bot className="size-4 text-orange-600" />
        </div>
      )}

      <div className="max-w-[85%] sm:max-w-[70%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-6",
            user
              ? "rounded-br-md bg-zinc-950 text-white"
              : "rounded-bl-md bg-zinc-100 text-zinc-800",
          )}
        >
          {content}
        </div>

        {!user && traces && traces.length > 0 && (
          <ul className="mt-2 space-y-1">
            {traces.map((trace) => (
              <li
                key={trace.name}
                className="flex items-center gap-2 text-xs text-zinc-500"
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    trace.ok ? "bg-green-500" : "bg-red-500",
                  )}
                />
                {trace.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
