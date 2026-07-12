import { request } from "./api";

interface AppConfig {
  deliveryFee: number;
}

let cachedConfig: AppConfig | null = null;

export async function getConfig(): Promise<AppConfig> {
  if (cachedConfig) return cachedConfig;
  cachedConfig = await request<AppConfig>("/config");
  return cachedConfig;
}
