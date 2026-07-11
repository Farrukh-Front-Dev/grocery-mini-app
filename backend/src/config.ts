import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envSchema = z.object({
  BOT_TOKEN: z.string().default("dev_token_placeholder"),
  ADMIN_IDS: z.string().default("1").transform((val) => val.split(",").map(Number).filter(Boolean)),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().default(path.join(__dirname, "..", "data", "grocery.db")),
  APP_URL: z.string().default("http://localhost:5173"),
  DEV_MODE: z.enum(["true", "false"]).default("true"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment:", parsed.error.flatten());
  process.exit(1);
}

export const config = { ...parsed.data, isDev: parsed.data.DEV_MODE === "true" };
