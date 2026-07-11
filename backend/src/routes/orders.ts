import { Router } from "express";
import { db, schema } from "../db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { notifyNewOrder, notifyStatusChange } from "../bot";
import type { OrderStatus } from "@grocery/shared";

const router = Router();

router.get("/", authMiddleware, (req, res) => {
  const orders = db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, req.userId!))
    .orderBy(desc(schema.orders.createdAt))
    .all()
    .map((o) => ({ ...o, items: JSON.parse(o.items) }));

  res.json(orders);
});

router.get("/all", authMiddleware, adminMiddleware, (_, res) => {
  const orders = db
    .select()
    .from(schema.orders)
    .orderBy(desc(schema.orders.createdAt))
    .all()
    .map((o) => ({ ...o, items: JSON.parse(o.items) }));

  res.json(orders);
});

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().positive(),
  })).min(1),
  deliveryLocation: z.string().optional(),
  paymentMethod: z.enum(["naqd", "online"]).default("naqd"),
});

router.post("/", authMiddleware, (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const { items, deliveryLocation, paymentMethod } = parsed.data;
  let subtotal = 0;
  const orderItems: { productId: number; quantity: number; priceAtOrder: number }[] = [];

  for (const item of items) {
    const product = db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, item.productId))
      .get();

    if (!product || !product.isActive) {
      res.status(400).json({ error: `Mahsulot topilmadi: ${item.productId}` });
      return;
    }

    if (product.stockQty < item.quantity) {
      res.status(400).json({
        error: `${product.name} dan yetarli emas`,
        available: product.stockQty,
      });
      return;
    }

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    orderItems.push({ productId: item.productId, quantity: item.quantity, priceAtOrder: product.price });
  }

  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const order = db
    .insert(schema.orders)
    .values({
      userId: req.userId!,
      items: JSON.stringify(orderItems),
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      deliveryLocation: deliveryLocation || null,
      status: "yangi",
    })
    .returning()
    .get();

  for (const item of items) {
    const product = db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, item.productId))
      .get()!;
    db.update(schema.products)
      .set({ stockQty: product.stockQty - item.quantity })
      .where(eq(schema.products.id, item.productId))
      .run();
  }

  res.json({ ...order, items: JSON.parse(order.items) });

  notifyNewOrder(order);
});

const statusSchema = z.object({
  status: z.enum(["tayyorlanmoqda", "yetkazildi", "bekor_qilindi"]),
  cancelReason: z.string().optional(),
});

router.patch("/:id/status", authMiddleware, adminMiddleware, (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const { status, cancelReason } = parsed.data;
  const update: Record<string, unknown> = { status };

  if (status === "yetkazildi") update.deliveredAt = new Date().toISOString();
  if (status === "bekor_qilindi") update.cancelReason = cancelReason || "Sabab ko'rsatilmagan";

  db.update(schema.orders)
    .set(update)
    .where(eq(schema.orders.id, Number(req.params.id)))
    .run();

  res.json({ ok: true });

  const order = db.select().from(schema.orders).where(eq(schema.orders.id, Number(req.params.id))).get();
  if (order) {
    notifyStatusChange(order.id, status as OrderStatus, order.userId, cancelReason);
  }
});

export default router;
