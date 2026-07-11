import { request } from "./api";

export interface AuthUser {
  id: number;
  name: string;
  isAdmin: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export function login(username: string, password: string): Promise<LoginResponse> {
  return request("/auth/login", { method: "POST", body: { username, password } });
}

export function register(username: string, password: string, name: string): Promise<{ ok: boolean }> {
  return request("/auth/register", { method: "POST", body: { username, password, name } });
}
