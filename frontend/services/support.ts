const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type SupportTrace = {
  name: string;
  ok: boolean;
  detail: string;
};

export type SupportReply = {
  reply: string;
  tools: SupportTrace[];
  order_id?: string;
};

export type SupportTicket = {
  id: string;
  order_id?: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

async function request(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }
  return data;
}

export function askSupport(message: string, orderId: string): Promise<SupportReply> {
  return request("/api/support/ask", {
    method: "POST",
    body: JSON.stringify({ message, order_id: orderId }),
  });
}

export function getSupportTickets(): Promise<{ tickets: SupportTicket[] }> {
  return request("/api/support/tickets");
}
