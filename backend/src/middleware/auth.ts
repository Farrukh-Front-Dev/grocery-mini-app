import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { config } from "../config";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";

const DEV_USER_ID = 1;

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

export const webTokens = new Map<string, number>();

function decodeToken(token: string): number | null {
  for (const [t, uid] of webTokens) {
    if (t === token) return uid;
  }
  return null;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  // Telegram WebApp auth
  if (auth?.startsWith("tma ")) {
    const user = validateInitData(auth.slice(4));
    if (!user) {
      res.status(401).json({ error: "Invalid initData" });
      return;
    }
    req.telegramUser = user;
    const dbUser = db.select().from(schema.users).where(eq(schema.users.telegramId, user.id)).get();
    req.userId = dbUser?.id;
    req.isAdmin = config.ADMIN_IDS.includes(user.id);
    next();
    return;
  }

  // Web app token auth
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const userId = decodeToken(token);
    if (!userId) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    const dbUser = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
    if (!dbUser) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    req.userId = dbUser.id;
    req.isAdmin = dbUser.isAdmin;
    req.telegramUser = { id: dbUser.id, first_name: dbUser.name };
    next();
    return;
  }

  // Dev mode fallback
  if (config.isDev) {
    req.telegramUser = { id: DEV_USER_ID, first_name: "Dev" };
    const dbUser = db.select().from(schema.users).where(eq(schema.users.telegramId, DEV_USER_ID)).get();
    req.userId = dbUser?.id ?? DEV_USER_ID;
    req.isAdmin = true;
    next();
    return;
  }

  res.status(401).json({ error: "Unauthorized" });
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
