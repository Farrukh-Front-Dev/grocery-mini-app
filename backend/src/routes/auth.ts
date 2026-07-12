import { Router, Request, Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { webTokens } from "../middleware/auth";

const router = Router();

const SALT_ROUNDS = 12;

function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(3),
  name: z.string().min(1),
  phone: z.string().optional(),
});

// Simple in-memory rate limiter
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

router.post("/login", async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: "Juda ko'p urinish. Bir daqiqa kuting." });
    return;
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const { username, password } = parsed.data;

  const user = db.select().from(schema.users).where(eq(schema.users.username, username)).get();

  if (!user || !user.password) {
    res.status(401).json({ error: "Noto'g'ri username yoki parol" });
    return;
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Noto'g'ri username yoki parol" });
    return;
  }

  const token = generateToken();
  webTokens.set(token, user.id);

  res.json({
    user: { id: user.id, name: user.name, isAdmin: user.isAdmin },
    token,
  });
});

router.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const { username, password, name, phone } = parsed.data;

  const existing = db.select().from(schema.users).where(eq(schema.users.username, username)).get();
  if (existing) {
    res.status(409).json({ error: "Bu username band" });
    return;
  }

  const hashed = await hashPassword(password);

  db.insert(schema.users).values({
    name,
    username,
    password: hashed,
    phone: phone || null,
    isAdmin: false,
    createdAt: new Date().toISOString(),
  }).run();

  res.json({ ok: true });
});

export default router;
