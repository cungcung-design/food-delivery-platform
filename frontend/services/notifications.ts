const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  data: {
    order_id?: string;
    delivery_id?: string;
    restaurant_id?: string;
  };
  is_read: boolean;
  created_at: string;
  read_at: string | null;
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

export function getNotifications(): Promise<{ notifications: Notification[] }> {
  return request("/api/notifications");
}

export function getUnreadCount(): Promise<{ count: number }> {
  return request("/api/notifications/unread-count");
}

export function markNotificationRead(id: string): Promise<{ notification: Notification }> {
  return request(`/api/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllRead(): Promise<{ message: string }> {
  return request("/api/notifications/read-all", { method: "POST" });
}
