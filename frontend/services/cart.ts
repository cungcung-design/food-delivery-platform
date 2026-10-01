const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type CartItem = {
  id: string;
  menu_item_id: string;
  name: string;
  price: string;
  quantity: number;
  line_total: string;
  is_available: boolean;
};

export type Cart = {
  id?: string;
  restaurant_id?: string;
  restaurant_name?: string;
  items: CartItem[];
  subtotal: string;
  delivery_fee: string;
  discount: string;
  total: string;
};

export type Address = {
  id: string;
  label: string;
  address_line: string;
  city: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
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

export function getCart(): Promise<{ cart: Cart }> {
  return request("/api/cart");
}

export function addCartItem(
  menuItemId: string,
  quantity = 1,
): Promise<{ cart: Cart }> {
  return request("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ menu_item_id: menuItemId, quantity }),
  });
}

export function updateCartItem(
  id: string,
  quantity: number,
): Promise<{ cart: Cart }> {
  return request(`/api/cart/items/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(id: string): Promise<{ cart: Cart }> {
  return request(`/api/cart/items/${id}`, { method: "DELETE" });
}

export function clearCart(): Promise<{ cart: Cart }> {
  return request("/api/cart", { method: "DELETE" });
}

export function getAddresses(): Promise<{ addresses: Address[] }> {
  return request("/api/addresses");
}

export function createAddress(input: {
  label: string;
  address_line: string;
  city: string;
  latitude?: number;
  longitude?: number;
}): Promise<{ address: Address }> {
  return request("/api/addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
