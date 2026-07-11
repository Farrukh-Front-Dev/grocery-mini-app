import { Router } from "express";
import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
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

router.post("/", authMiddleware, (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || typeof quantity !== "number" || quantity <= 0) {
    res.status(400).json({ error: "Invalid productId or quantity" });
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
