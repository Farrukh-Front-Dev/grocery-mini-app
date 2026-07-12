import { Router } from "express";
import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, (req, res) => {
  const items = db
    .select()
    .from(schema.cartItems)
    .where(eq(schema.cartItems.userId, req.userId!))
    .all();
  res.json(items);
});

const addCartSchema = z.object({
  productId: z.number(),
  quantity: z.number().positive(),
});

router.post("/", authMiddleware, (req, res) => {
  const parsed = addCartSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid productId or quantity" });
    return;
  }

  const { productId, quantity } = parsed.data;

  const product = db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, productId))
    .get();

  if (!product || !product.isActive) {
    res.status(400).json({ error: "Mahsulot topilmadi" });
    return;
  }

  if (quantity % product.step !== 0 && quantity < product.step) {
    res.status(400).json({ error: `Minimal qadam ${product.step}` });
    return;
  }

  const existing = db
    .select()
    .from(schema.cartItems)
    .where(
      and(eq(schema.cartItems.userId, req.userId!), eq(schema.cartItems.productId, productId))
    )
    .get();

  if (existing) {
    db.update(schema.cartItems)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(schema.cartItems.id, existing.id))
      .run();
  } else {
    db.insert(schema.cartItems)
      .values({ userId: req.userId!, productId, quantity })
      .run();
  }

  res.json({ ok: true });
});

const updateCartSchema = z.object({
  quantity: z.number().positive(),
});

router.patch("/:productId", authMiddleware, (req, res) => {
  const parsed = updateCartSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid quantity" });
    return;
  }

  const { quantity } = parsed.data;
  const productId = Number(req.params.productId);

  const product = db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, productId))
    .get();

  if (!product || !product.isActive) {
    res.status(400).json({ error: "Mahsulot topilmadi" });
    return;
  }

  if (quantity % product.step !== 0 && quantity < product.step) {
    res.status(400).json({ error: `Minimal qadam ${product.step}` });
    return;
  }

  const existing = db
    .select()
    .from(schema.cartItems)
    .where(
      and(eq(schema.cartItems.userId, req.userId!), eq(schema.cartItems.productId, productId))
    )
    .get();

  if (!existing) {
    res.status(404).json({ error: "Cart item not found" });
    return;
  }

  db.update(schema.cartItems)
    .set({ quantity })
    .where(eq(schema.cartItems.id, existing.id))
    .run();

  res.json({ ok: true });
});

router.delete("/:productId", authMiddleware, (req, res) => {
  db.delete(schema.cartItems)
    .where(
      and(eq(schema.cartItems.userId, req.userId!), eq(schema.cartItems.productId, Number(req.params.productId)))
    )
    .run();
  res.json({ ok: true });
});

router.delete("/", authMiddleware, (req, res) => {
  db.delete(schema.cartItems).where(eq(schema.cartItems.userId, req.userId!)).run();
  res.json({ ok: true });
});

export default router;
