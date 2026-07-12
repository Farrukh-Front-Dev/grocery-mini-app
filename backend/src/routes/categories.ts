import { Router } from "express";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().default("🛒"),
  sortOrder: z.number().default(0),
});

router.get("/", (_, res) => {
  const categories = db.select().from(schema.categories).orderBy(schema.categories.sortOrder).all();
  res.json(categories);
});

router.post("/", authMiddleware, adminMiddleware, (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const category = db.insert(schema.categories).values(parsed.data).returning().get();
  res.json(category);
});

router.patch("/:id", authMiddleware, adminMiddleware, (req, res) => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  db.update(schema.categories).set(parsed.data).where(eq(schema.categories.id, Number(req.params.id))).run();
  res.json({ ok: true });
});

router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => {
  db.delete(schema.categories).where(eq(schema.categories.id, Number(req.params.id))).run();
  res.json({ ok: true });
});

export default router;
