import { http } from "@/services/http";
import type { AuthUser } from "@/auth/types";

type AuthResponse = { user: AuthUser };

export function login(identifier: string, password: string) {
  return http<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export function fetchMe() {
  return http<AuthResponse>("/api/auth/me");
}

export function logout() {
  return http<{ success: true }>("/api/auth/logout", { method: "POST" });
}

export function refresh() {
  return http<AuthResponse>("/api/auth/refresh", { method: "POST" });
}
