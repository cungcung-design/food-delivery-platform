"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Container } from "@/components/ui/Container";

import { ActionConfirmation } from "@/components/assistant/ActionConfirmation";
import { ChatHeader } from "@/components/assistant/ChatHeader";
import {
  ChatMessages,
  type Message,
} from "@/components/assistant/ChatMessages";
import { ChatInput } from "@/components/assistant/ChatInput";
import { SuggestedPrompts } from "@/components/assistant/SuggestedPrompts";

import { askSupport } from "@/services/support";

const WELCOME =
  "Hi! I can check your orders, explain the refund policy, cancel a pending order, or open a support ticket.";

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content: WELCOME,
  },
];

/**
 * Mirrors IsCancelAction in backend/internal/ai/tools.go. Questions and
 * polite prefixes are never treated as destructive, so they go straight
 * through without a confirmation step.
 */
function looksLikeCancelAction(message: string): boolean {
  const text = message.trim().toLowerCase();

  if (text.includes("?")) {
    return false;
  }

  const prefixes = [
    "can ",
    "could ",
    "should ",
    "may ",
    "what ",
    "how ",
    "is ",
    "do ",
  ];

  if (prefixes.some((prefix) => text.startsWith(prefix))) {
    return false;
  }

  return text.includes("cancel");
}

export default function AssistantPage() {
  return (
    <CustomerLayout>
      <Container className="py-5 sm:py-8">
        <Suspense fallback={<AssistantShell />}>
          <AssistantChat />
        </Suspense>
      </Container>
    </CustomerLayout>
  );
}

function AssistantShell() {
  return (
    <div className="mx-auto flex h-[calc(100dvh-11rem)] max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm md:h-[calc(100dvh-10rem)]">
      <ChatHeader />
      <ChatMessages messages={initialMessages} loading={false} />
    </div>
  );
}

function AssistantChat() {
  const params = useSearchParams();
  const orderId = params.get("order") ?? "";

  const [messages, setMessages] =
    useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  async function send(content: string) {
    setLoading(true);

    try {
      const reply = await askSupport(content, orderId);

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply.reply,
          traces: reply.tools,
        },
      ]);
    } catch (sendError) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            sendError instanceof Error
              ? sendError.message
              : "I couldn't reach support right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend(content: string) {
    if (loading) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    setMessages((current) => [...current, userMessage]);

    if (looksLikeCancelAction(content)) {
      setPending(content);
      return;
    }

    void send(content);
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-11rem)] max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm md:h-[calc(100dvh-10rem)]">
      <ChatHeader />

      {messages.length === 1 && !loading && !pending && (
        <div className="border-b border-zinc-100 px-4 py-4 sm:px-6">
          <SuggestedPrompts onSelect={handleSend} />
        </div>
      )}

      <ChatMessages messages={messages} loading={loading} />

      {pending && (
        <div className="border-t border-zinc-200 p-3 sm:p-4">
          <ActionConfirmation
            title="Send a cancellation request?"
            description={
              orderId
                ? "This asks the platform to cancel the order you are viewing. It only succeeds while the order is pending or confirmed."
                : "This asks the platform to cancel an order. It only succeeds while the order is pending or confirmed."
            }
            confirmLabel="Send request"
            loading={loading}
            onConfirm={() => {
              const content = pending;
              setPending(null);
              void send(content);
            }}
            onCancel={() => setPending(null)}
          />
        </div>
      )}

      {!pending && (
        <ChatInput disabled={loading} onSend={handleSend} />
      )}
    </div>
  );
}
