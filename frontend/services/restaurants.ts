const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type Restaurant = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address_line: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  status: "OPEN" | "CLOSED" | "SUSPENDED";
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

export async function getRestaurants(): Promise<{ restaurants: Restaurant[] }> {
  return request("/api/restaurants");
}

export async function getRestaurant(
  id: string,
): Promise<{ restaurant: Restaurant }> {
  return request(`/api/restaurants/${id}`);
}

export async function getMyRestaurants(): Promise<{
  restaurants: Restaurant[];
}> {
  return request("/api/restaurant-owner/restaurants");
}

export async function updateRestaurantStatus(
  id: string,
  status: "OPEN" | "CLOSED",
): Promise<{ restaurant: Restaurant }> {
  return request(`/api/restaurant-owner/restaurants/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
