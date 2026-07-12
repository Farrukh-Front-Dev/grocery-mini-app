import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { eq } from "drizzle-orm";
import * as schema from "./db/schema";

const sqlite = new Database(":memory:");
const db = drizzle(sqlite, { schema });

beforeAll(() => {
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  migrate(db, { migrationsFolder: "./drizzle" });

  db.insert(schema.users).values({ telegramId: 1, name: "Test", isAdmin: true }).run();

  db.insert(schema.categories).values({ id: 1, name: "Test", icon: "T", sortOrder: 1 }).run();

  db.insert(schema.products).values({
    id: 1, categoryId: 1, name: "Kartoshka", price: 5000,
    unit: "kg", step: 0.5, stockQty: 10, isActive: true,
  }).run();

  db.insert(schema.products).values({
    id: 2, categoryId: 1, name: "Piyoz", price: 3000,
    unit: "kg", step: 0.5, stockQty: 5, isActive: true,
  }).run();
});

afterAll(() => {
  sqlite.close();
});

function createOrder(items: { productId: number; quantity: number }[]) {
  const userId = 1;
  let subtotal = 0;
  const orderItems: { productId: number; quantity: number; priceAtOrder: number }[] = [];

  for (const item of items) {
    const product = db.select().from(schema.products).where(eq(schema.products.id, item.productId)).get()!;
    if (product.stockQty < item.quantity) {
      throw new Error(`${product.name} dan yetarli emas`);
    }
    subtotal += product.price * item.quantity;
    orderItems.push({ productId: item.productId, quantity: item.quantity, priceAtOrder: product.price });
  }

  const order = db.insert(schema.orders).values({
    userId,
    items: JSON.stringify(orderItems),
    subtotal,
    deliveryFee: 0,
    total: subtotal,
    paymentMethod: "naqd",
    status: "yangi",
  }).returning().get();

  for (const item of items) {
    const product = db.select().from(schema.products).where(eq(schema.products.id, item.productId)).get()!;
    db.update(schema.products).set({ stockQty: product.stockQty - item.quantity })
      .where(eq(schema.products.id, item.productId)).run();
  }

  return order;
}

function cancelOrder(orderId: number) {
  const order = db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).get()!;
  const orderItems: { productId: number; quantity: number }[] = JSON.parse(order.items);

  for (const item of orderItems) {
    const product = db.select().from(schema.products).where(eq(schema.products.id, item.productId)).get()!;
    db.update(schema.products).set({ stockQty: product.stockQty + item.quantity })
      .where(eq(schema.products.id, item.productId)).run();
  }

  db.update(schema.orders).set({ status: "bekor_qilindi", cancelReason: "Test" })
    .where(eq(schema.orders.id, orderId)).run();
}

function deliverOrder(orderId: number) {
  db.update(schema.orders).set({ status: "yetkazildi", deliveredAt: new Date().toISOString() })
    .where(eq(schema.orders.id, orderId)).run();
}

describe("Order operations", () => {
  it("stock decrements when order is created", () => {
    const product = db.select().from(schema.products).where(eq(schema.products.id, 1)).get()!;
    expect(product.stockQty).toBe(10);

    createOrder([{ productId: 1, quantity: 3 }]);

    const updated = db.select().from(schema.products).where(eq(schema.products.id, 1)).get()!;
    expect(updated.stockQty).toBe(7);
  });

  it("rejects order when stock is insufficient", () => {
    expect(() => createOrder([{ productId: 2, quantity: 10 }])).toThrow("yetarli emas");
  });

  it("stock restores when order is cancelled", () => {
    const order = createOrder([{ productId: 1, quantity: 2 }, { productId: 2, quantity: 1 }]);

    let p1 = db.select().from(schema.products).where(eq(schema.products.id, 1)).get()!;
    let p2 = db.select().from(schema.products).where(eq(schema.products.id, 2)).get()!;
    expect(p1.stockQty).toBe(5);
    expect(p2.stockQty).toBe(4);

    cancelOrder(order.id);

    p1 = db.select().from(schema.products).where(eq(schema.products.id, 1)).get()!;
    p2 = db.select().from(schema.products).where(eq(schema.products.id, 2)).get()!;
    expect(p1.stockQty).toBe(7);
    expect(p2.stockQty).toBe(5);
  });

  it("delivered orders move to history (status transition)", () => {
    const order = createOrder([{ productId: 1, quantity: 1 }]);
    expect(order.status).toBe("yangi");

    deliverOrder(order.id);

    const delivered = db.select().from(schema.orders).where(eq(schema.orders.id, order.id)).get()!;
    expect(delivered.status).toBe("yetkazildi");
    expect(delivered.deliveredAt).not.toBeNull();
  });
});
