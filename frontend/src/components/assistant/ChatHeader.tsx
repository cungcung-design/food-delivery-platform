import { Bot, CircleCheck } from "lucide-react";

export function ChatHeader() {
  return (
    <header className="flex items-center gap-3 border-b border-zinc-200 px-4 py-4 sm:px-6">
      <div className="flex size-11 items-center justify-center rounded-xl bg-orange-500 text-white">
        <Bot className="size-5" />
      </div>

      <div>
        <h1 className="font-bold">Foodly Assistant</h1>

        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
          <CircleCheck className="size-3.5 text-green-500" />
          Customer support
        </div>
      </div>
    </header>
  );
}
