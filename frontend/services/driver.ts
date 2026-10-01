const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type DriverProfile = {
  id: string;
  status: string;
  vehicle_type: string | null;
  vehicle_number: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type DeliveryJob = {
  id: string;
  order_id: string;
  order_status: string;
  status: string;
  restaurant_id: string;
  total: string;
};

export type CompletedDelivery = {
  id: string;
  order_id: string;
  status: string;
  restaurant_name: string;
  pickup_address: string;
  earning: string;
  order_total: string;
  delivered_at: string;
};

export type DriverEarnings = {
  completed_count: number;
  total: string;
  today_count: number;
  today_total: string;
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

export function saveDriverProfile(input: {
  vehicle_type: string;
  vehicle_number: string;
}): Promise<{ driver: DriverProfile }> {
  return request("/api/driver/profile", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getDriver(): Promise<{ driver: DriverProfile }> {
  return request("/api/driver/me");
}

export function setDriverStatus(
  status: "OFFLINE" | "AVAILABLE" | "PAUSED",
): Promise<{ driver: DriverProfile }> {
  return request("/api/driver/status", {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function setDriverLocation(
  latitude: number,
  longitude: number,
): Promise<{ driver: DriverProfile }> {
  return request("/api/driver/location", {
    method: "PATCH",
    body: JSON.stringify({ latitude, longitude }),
  });
}

export function getDeliveries(): Promise<{ deliveries: DeliveryJob[] }> {
  return request("/api/driver/deliveries");
}

export function getDriverHistory(): Promise<{ deliveries: CompletedDelivery[] }> {
  return request("/api/driver/history");
}

export function getDriverEarnings(): Promise<{ earnings: DriverEarnings }> {
  return request("/api/driver/earnings");
}

export function acceptDelivery(id: string): Promise<{ delivery: DeliveryJob }> {
  return request(`/api/driver/deliveries/${id}/accept`, { method: "POST" });
}

export function advanceDelivery(
  id: string,
  status: "PICKED_UP" | "OUT_FOR_DELIVERY" | "DELIVERED",
): Promise<{ delivery: DeliveryJob }> {
  return request(`/api/driver/deliveries/${id}/advance`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}
