import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envSchema = z.object({
  BOT_TOKEN: z.string().min(1, "BOT_TOKEN is required"),
  ADMIN_IDS: z.string().transform((val) => val.split(",").map(Number).filter(Boolean)),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().default(path.join(__dirname, "..", "data", "grocery.db")),
  APP_URL: z.string().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment:", parsed.error.flatten());
  process.exit(1);
}

export const config = parsed.data;
