import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { config } from "../config";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  [key: string]: unknown;
}

function validateInitData(initData: string): TelegramUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(config.BOT_TOKEN)
    .digest();

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) return null;

  try {
    return JSON.parse(params.get("user") || "{}") as TelegramUser;
  } catch {
    return null;
  }
}

declare global {
  namespace Express {
    interface Request {
      telegramUser?: TelegramUser;
      userId?: number;
      isAdmin?: boolean;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("tma ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = validateInitData(auth.slice(4));
  if (!user) {
    res.status(401).json({ error: "Invalid initData" });
    return;
  }

  req.telegramUser = user;

  const dbUser = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.telegramId, user.id))
    .get();

  req.userId = dbUser?.id;
  req.isAdmin = config.ADMIN_IDS.includes(user.id);
  next();
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
