const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type OrderItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  subtotal: string;
};

export type Order = {
  id: string;
  user_id: string;
  restaurant_id: string;
  delivery_address_id: string;
  status: string;
  payment_status: string;
  subtotal: string;
  delivery_fee: string;
  discount: string;
  total: string;
  created_at: string;
  items?: OrderItem[];
};

export type Tracking = {
  order_id: string;
  order_status: string;
  delivery_id?: string;
  delivery_status?: string;
  latitude: number | null;
  longitude: number | null;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  dropoff_latitude: number | null;
  dropoff_longitude: number | null;
  points: { latitude: number; longitude: number; recorded_at: string }[];
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

export function checkout(addressId: string): Promise<{ order: Order }> {
  return request("/api/checkout", {
    method: "POST",
    body: JSON.stringify({ address_id: addressId }),
  });
}

export function getMyOrders(): Promise<{ orders: Order[] }> {
  return request("/api/orders");
}

export function getOrder(id: string): Promise<{ order: Order }> {
  return request(`/api/orders/${id}`);
}

export function updateOrderStatus(
  id: string,
  status: string,
): Promise<{ order: Order }> {
  return request(`/api/orders/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export function getRestaurantOrders(): Promise<{ orders: Order[] }> {
  return request("/api/restaurant-owner/orders");
}

export function updateRestaurantOrder(
  id: string,
  status: string,
): Promise<{ order: Order }> {
  return request(`/api/restaurant-owner/orders/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export function getTracking(id: string): Promise<{ tracking: Tracking }> {
  return request(`/api/orders/${id}/tracking`);
}

export function trackingStreamUrl(id: string) {
  return `${API_URL}/api/orders/${id}/tracking/stream`;
}
