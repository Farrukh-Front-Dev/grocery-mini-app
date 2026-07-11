import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }),
  telegramId: integer("telegram_id").notNull().unique(),
  name: text().notNull().default(""),
  phone: text(),
  isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default("datetime('now')"),
});

export const categories = sqliteTable("categories", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  icon: text().notNull().default("🛒"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = sqliteTable("products", {
  id: integer().primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  name: text().notNull(),
  price: integer().notNull(),
  unit: text().notNull().default("kg"),
  step: real().notNull().default(0.5),
  image: text(),
  stockQty: real("stock_qty").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const cartItems = sqliteTable("cart_items", {
  id: integer().primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: real().notNull(),
});

export const orders = sqliteTable("orders", {
  id: integer().primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  items: text().notNull(),
  subtotal: integer().notNull(),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  total: integer().notNull(),
  paymentMethod: text("payment_method").notNull().default("naqd"),
  deliveryLocation: text("delivery_location"),
  status: text().notNull().default("yangi"),
  cancelReason: text("cancel_reason"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
  deliveredAt: text("delivered_at"),
});

export const expenses = sqliteTable("expenses", {
  id: integer().primaryKey({ autoIncrement: true }),
  description: text().notNull(),
  amount: integer().notNull(),
  createdByAdminId: integer("created_by_admin_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default("datetime('now')"),
});
