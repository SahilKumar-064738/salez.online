import { apiUrl } from "@/lib/api";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  companyName: string | null;
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Login failed");
  }
  return res.json();
}

export async function signupUser(data: {
  name: string;
  companyName: string; // frontend-friendly
  email: string;
  password: string;
}): Promise<AuthUser> {
  const res = await fetch(apiUrl("/api/auth/signup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name: data.name,
      company_name: data.companyName, // ✅ snake_case
      email: data.email,
      password: data.password,
    }),
  });

  if (!res.ok) {
  const text = await res.text();

  try {
    const json = JSON.parse(text);
    throw new Error(json.message || "Signup failed");
  } catch {
    throw new Error(text || "Signup failed");
  }
}

  return res.json();
}

export async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch(apiUrl("/api/auth/me"), { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return res.json();
}

export async function logoutUser(): Promise<void> {
  await fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
}
