type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthResponse = {
  user: User;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function request(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export function logout() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser() {
  return request("/api/auth/me");
}
