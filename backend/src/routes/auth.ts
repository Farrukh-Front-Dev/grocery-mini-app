import { Router, Request, Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { config } from "../config";
import { webTokens } from "../middleware/auth";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}:${Math.random()}`;
  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 32);
}

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(3),
  name: z.string().min(1),
});

router.post("/login", (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const { username, password } = parsed.data;

  // Test mode hardcoded credentials
  if (config.isDev) {
    if (username === "admin" && password === "admin") {
      let user = db.select().from(schema.users).where(eq(schema.users.username, "admin")).get();
      if (!user) {
        db.insert(schema.users).values({ name: "Admin", username: "admin", password: hashPassword("admin"), isAdmin: true }).run();
        user = db.select().from(schema.users).where(eq(schema.users.username, "admin")).get()!;
      }
      const token = generateToken(user.id);
      webTokens.set(token, user.id);
      res.json({ user: { id: user.id, name: user.name, isAdmin: true }, token });
      return;
    }
    if (username === "user" && password === "user") {
      let user = db.select().from(schema.users).where(eq(schema.users.username, "user")).get();
      if (!user) {
        db.insert(schema.users).values({ name: "User", username: "user", password: hashPassword("user"), isAdmin: false }).run();
        user = db.select().from(schema.users).where(eq(schema.users.username, "user")).get()!;
      }
      const token = generateToken(user.id);
      webTokens.set(token, user.id);
      res.json({ user: { id: user.id, name: user.name, isAdmin: false }, token });
      return;
    }
  }

  // Normal DB lookup
  const user = db.select().from(schema.users).where(eq(schema.users.username, username)).get();

  if (!user || !user.password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (user.password !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = generateToken(user.id);
  webTokens.set(token, user.id);

  res.json({
    user: { id: user.id, name: user.name, isAdmin: user.isAdmin },
    token,
  });
});

router.post("/register", (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const { username, password, name } = parsed.data;

  const existing = db.select().from(schema.users).where(eq(schema.users.username, username)).get();
  if (existing) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  db.insert(schema.users).values({
    name,
    username,
    password: hashPassword(password),
    isAdmin: false,
  }).run();

  res.json({ ok: true });
});

export default router;
