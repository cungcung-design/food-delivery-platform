"use client";

import { useEffect, useRef } from "react";

import { LoaderCircle } from "lucide-react";

import { ChatMessage } from "./ChatMessage";
import type { SupportTrace } from "@/services/support";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  traces?: SupportTrace[];
}

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
}

export function ChatMessages({ messages, loading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-5">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            traces={message.traces}
          />
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100">
              <LoaderCircle className="size-4 animate-spin text-orange-600" />
            </div>

            Checking that for you...
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
