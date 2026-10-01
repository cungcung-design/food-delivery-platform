"use client";

import { FormEvent, useState } from "react";

import { Send } from "lucide-react";

const MAX_LENGTH = 4000;

interface ChatInputProps {
  disabled?: boolean;
  onSend: (message: string) => void;
}

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = message.trim();

    if (!value || disabled) {
      return;
    }

    onSend(value);
    setMessage("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-zinc-200 bg-white p-3 sm:p-4"
    >
      <div className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-white p-2 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={disabled}
          rows={1}
          maxLength={MAX_LENGTH}
          placeholder="Ask about your order..."
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
        />

        <button
          type="submit"
          disabled={disabled || !message.trim()}
          aria-label="Send message"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="size-4" />
        </button>
      </div>

      <p className="mt-2 text-center text-[11px] text-zinc-400">
        Order changes are verified by the platform before they take
        effect.
      </p>
    </form>
  );
}
