const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type Issue = {
  order_id: string;
  restaurant: string;
  status: string;
  delivery_status?: string;
  reason: string;
};

export type Recommendation = {
  id: string;
  order_id: string;
  driver_id?: string;
  reason: string;
  distance_km?: number;
  created_at: string;
};

/** One read-only tool execution recorded while answering a report request. */
export type Trace = {
  name: string;
  ok: boolean;
  detail: string;
};

export type OperationsReport = {
  reply: string;
  tools?: Trace[];
  issues: Issue[];
  recommendations?: Recommendation[];
};

export type AIHealth = {
  status: string;
  ai_service: string;
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

export function getOperationsReport(): Promise<OperationsReport> {
  return request("/api/operations/report");
}

export function askOperations(message: string): Promise<OperationsReport> {
  return request("/api/operations/ask", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function recommendDriver(orderId: string): Promise<{ reply: string; recommendation: Recommendation }> {
  return request("/api/dispatch/recommend", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId }),
  });
}

export function getDispatchRecommendations(): Promise<{
  recommendations: Recommendation[];
}> {
  return request("/api/dispatch/recommendations");
}

export function getAIHealth(): Promise<AIHealth> {
  return request("/api/ai/health");
}