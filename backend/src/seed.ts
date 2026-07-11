import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, schema } from "./db/index.js";
import { config } from "./config.js";

const userId = config.isDev ? 1 : 0;
const adminId = config.ADMIN_IDS[0] || 1;

// Create default user for dev mode
const existing = db.select().from(schema.users).where(eq(schema.users.telegramId, userId)).get();
if (!existing) {
  db.insert(schema.users).values({ telegramId: userId, name: "Dev User", isAdmin: true }).run();
  console.log("Dev user created");
}

// Create categories
const catNames = [
  { name: "Sabzavotlar", icon: "🥕", sort: 1 },
  { name: "Mevalar", icon: "🍎", sort: 2 },
  { name: "Sut mahsulotlari", icon: "🧀", sort: 3 },
  { name: "Non mahsulotlari", icon: "🍞", sort: 4 },
  { name: "Ichimliklar", icon: "🧃", sort: 5 },
];

for (const cat of catNames) {
  const exists = db.select().from(schema.categories).where(eq(schema.categories.name, cat.name)).get();
  if (!exists) {
    db.insert(schema.categories).values(cat).run();
  }
}

// Create sample products
const sampleProducts = [
  { name: "Kartoshka", price: 5000, unit: "kg", step: 0.5, stockQty: 50, categoryId: 1 },
  { name: "Piyoz", price: 3000, unit: "kg", step: 0.5, stockQty: 30, categoryId: 1 },
  { name: "Sabzi", price: 4000, unit: "kg", step: 0.5, stockQty: 25, categoryId: 1 },
  { name: "Pomidor", price: 12000, unit: "kg", step: 0.5, stockQty: 20, categoryId: 1 },
  { name: "Bodring", price: 8000, unit: "kg", step: 0.5, stockQty: 15, categoryId: 1 },
  { name: "Olma", price: 10000, unit: "kg", step: 0.5, stockQty: 30, categoryId: 2 },
  { name: "Banan", price: 15000, unit: "kg", step: 0.5, stockQty: 20, categoryId: 2 },
  { name: "Apelsin", price: 18000, unit: "kg", step: 0.5, stockQty: 15, categoryId: 2 },
  { name: "Uzum", price: 20000, unit: "kg", step: 0.5, stockQty: 10, categoryId: 2 },
  { name: "Sut (1L)", price: 8000, unit: "litr", step: 1, stockQty: 40, categoryId: 3 },
  { name: "Qatiq (500ml)", price: 5000, unit: "dona", step: 1, stockQty: 50, categoryId: 3 },
  { name: "Pishloq", price: 25000, unit: "kg", step: 0.2, stockQty: 10, categoryId: 3 },
  { name: "Non", price: 4000, unit: "dona", step: 1, stockQty: 100, categoryId: 4 },
  { name: "Lepeshka", price: 6000, unit: "dona", step: 1, stockQty: 60, categoryId: 4 },
  { name: "Suv (1.5L)", price: 3000, unit: "dona", step: 1, stockQty: 100, categoryId: 5 },
  { name: "Sharbat (1L)", price: 12000, unit: "dona", step: 1, stockQty: 30, categoryId: 5 },
];

for (const p of sampleProducts) {
  const exists = db.select().from(schema.products).where(eq(schema.products.name, p.name)).get();
  if (!exists) {
    db.insert(schema.products).values(p).run();
  }
}

console.log("Seed completed!");
