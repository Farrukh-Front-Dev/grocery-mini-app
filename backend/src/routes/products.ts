import { Router } from "express";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, (_, res) => {
  const products = db
    .select()
    .from(schema.products)
    .where(eq(schema.products.isActive, true))
    .all();
  res.json(products);
});

router.get("/categories", authMiddleware, (_, res) => {
  const categories = db
    .select()
    .from(schema.categories)
    .orderBy(schema.categories.sortOrder)
    .all();
  res.json(categories);
});

const productSchema = z.object({
  categoryId: z.number(),
  name: z.string().min(1),
  price: z.number().positive(),
  unit: z.enum(["kg", "litr", "dona"]),
  step: z.number().positive().default(0.5),
  stockQty: z.number().default(0),
});

router.post("/", authMiddleware, adminMiddleware, (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const product = db
    .insert(schema.products)
    .values(parsed.data)
    .returning()
    .get();

  res.json(product);
});

router.patch("/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { name, price, unit, step, stockQty, categoryId, isActive } = req.body;

  db.update(schema.products)
    .set({ name, price, unit, step, stockQty, categoryId, isActive })
    .where(eq(schema.products.id, id))
    .run();

  res.json({ ok: true });
});

router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => {
  db.delete(schema.products).where(eq(schema.products.id, Number(req.params.id))).run();
  res.json({ ok: true });
});

export default router;
