import { Router } from "express";
import { db, rawDb, schema } from "../db";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { notifyNewOrder, notifyStatusChange } from "../bot";
import type { OrderStatus, OrderItem } from "@grocery/shared";

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
  const orderItems: OrderItem[] = [];

  const productCache = new Map<number, { price: number; stockQty: number; name: string; step: number }>();

  for (const item of items) {
    const product = db
      .select({ price: schema.products.price, stockQty: schema.products.stockQty, name: schema.products.name, step: schema.products.step, isActive: schema.products.isActive })
      .from(schema.products)
      .where(eq(schema.products.id, item.productId))
      .get();

    if (!product || !product.isActive) {
      res.status(400).json({ error: `Mahsulot topilmadi: ${item.productId}` });
      return;
    }

    if (item.quantity % product.step !== 0 && item.quantity < product.step) {
      res.status(400).json({ error: `${product.name} uchun minimal qadam ${product.step} ${product.step >= 1 ? "dona" : "kg"}` });
      return;
    }

    if (product.stockQty < item.quantity) {
      res.status(400).json({
        error: `${product.name} dan yetarli emas`,
        available: product.stockQty,
      });
      return;
    }

    const lineTotal = Math.round(product.price * item.quantity);
    subtotal += lineTotal;
    orderItems.push({ productId: item.productId, quantity: item.quantity, priceAtOrder: product.price });
    productCache.set(item.productId, product);
  }

  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const createOrder = rawDb.transaction(() => {
    for (const item of items) {
      const p = productCache.get(item.productId)!;
      db.update(schema.products)
        .set({ stockQty: sql`stock_qty - ${item.quantity}` })
        .where(eq(schema.products.id, item.productId))
        .run();
    }

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

    return order;
  });

  const order = createOrder();
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
  const orderId = Number(req.params.id);

  const updateOrder = rawDb.transaction(() => {
    const order = db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).get();
    if (!order) {
      throw new Error("Buyurtma topilmadi");
    }

    if (status === "yetkazildi") {
      db.update(schema.orders)
        .set({ status, deliveredAt: new Date().toISOString() })
        .where(eq(schema.orders.id, orderId))
        .run();
    } else if (status === "bekor_qilindi") {
      const items: OrderItem[] =
        typeof order.items === "string" ? JSON.parse(order.items) : order.items;
      for (const item of items) {
        db.update(schema.products)
          .set({ stockQty: sql`stock_qty + ${item.quantity}` })
          .where(eq(schema.products.id, item.productId))
          .run();
      }
      db.update(schema.orders)
        .set({ status, cancelReason: cancelReason || "Sabab ko'rsatilmagan" })
        .where(eq(schema.orders.id, orderId))
        .run();
    } else {
      db.update(schema.orders)
        .set({ status })
        .where(eq(schema.orders.id, orderId))
        .run();
    }
  });

  try {
    updateOrder();
    res.json({ ok: true });

    const order = db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).get();
    if (order) {
      notifyStatusChange(order.id, status as OrderStatus, order.userId, cancelReason);
    }
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Xatolik yuz berdi" });
  }
});

export default router;
