import { Router } from "express";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, (req, res) => {
  const includeInactive = req.query.all === "true" && req.isAdmin;
  const products = includeInactive
    ? db.select().from(schema.products).all()
    : db.select().from(schema.products).where(eq(schema.products.isActive, true)).all();
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
  image: z.string().optional(),
});

router.post("/", authMiddleware, adminMiddleware, (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const product = db
    .insert(schema.products)
    .values({ ...parsed.data, isActive: true })
    .returning()
    .get();

  res.json(product);
});

const productUpdateSchema = z.object({
  categoryId: z.number().optional(),
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  unit: z.enum(["kg", "litr", "dona"]).optional(),
  step: z.number().positive().optional(),
  stockQty: z.number().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.patch("/:id", authMiddleware, adminMiddleware, (req, res) => {
  const parsed = productUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  db.update(schema.products)
    .set(parsed.data)
    .where(eq(schema.products.id, Number(req.params.id)))
    .run();

  res.json({ ok: true });
});

router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => {
  db.delete(schema.products).where(eq(schema.products.id, Number(req.params.id))).run();
  res.json({ ok: true });
});

export default router;
