const BASE = "/api";

function getWebToken(): string {
  try {
    const raw = localStorage.getItem("grocery-auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.token || "";
    }
  } catch {}
  return "";
}

function getInitData(): string {
  try {
    return window.Telegram?.WebApp?.initData || "";
  } catch {
    return "";
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const initData = getInitData();
  const webToken = getWebToken();

  let authorization = "";
  if (initData) {
    authorization = `tma ${initData}`;
  } else if (webToken) {
    authorization = `Bearer ${webToken}`;
  }

  const body = options.body && typeof options.body === "object"
    ? JSON.stringify(options.body)
    : (options.body as BodyInit | undefined);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authorization) headers.Authorization = authorization;
  if (options.headers) Object.assign(headers, options.headers);

  const res = await fetch(`${BASE}${path}`, {
    method: options.method || "GET",
    body,
    headers,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(errBody.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
