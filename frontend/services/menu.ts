const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type MenuCategory = {
  id: string;
  restaurant_id: string;
  name: string;
};

export type MenuItem = {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  is_available: boolean;
};

export type MenuResponse = {
  categories: MenuCategory[];
  items: MenuItem[];
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

export async function getMenu(restaurantId: string): Promise<MenuResponse> {
  const response = await fetch(
    `${API_URL}/api/restaurants/${restaurantId}/menu`,
  );

  if (!response.ok) {
    throw new Error("Could not load menu.");
  }

  return response.json();
}

export async function getOwnerMenu(
  restaurantId: string,
): Promise<MenuResponse> {
  return request(`/api/restaurant-owner/restaurants/${restaurantId}/menu`);
}

export async function createCategory(
  restaurantId: string,
  name: string,
): Promise<{ category: MenuCategory }> {
  return request(
    `/api/restaurant-owner/restaurants/${restaurantId}/categories`,
    {
      method: "POST",
      body: JSON.stringify({ name }),
    },
  );
}

export async function createMenuItem(
  restaurantId: string,
  input: {
    category_id: string;
    name: string;
    description?: string;
    price: string;
  },
): Promise<{ item: MenuItem }> {
  return request(
    `/api/restaurant-owner/restaurants/${restaurantId}/menu-items`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function setItemAvailability(
  itemId: string,
  isAvailable: boolean,
): Promise<{ item: MenuItem }> {
  return request(`/api/restaurant-owner/menu-items/${itemId}/availability`, {
    method: "PATCH",
    body: JSON.stringify({ is_available: isAvailable }),
  });
}
