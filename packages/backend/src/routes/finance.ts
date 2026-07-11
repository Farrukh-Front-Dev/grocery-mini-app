import { Router } from "express";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

router.get("/summary", authMiddleware, adminMiddleware, (_, res) => {
  const deliveredOrders = db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.status, "yetkazildi"))
    .all();

  const totalIncome = deliveredOrders.reduce((sum, o) => sum + o.total, 0);

  const allExpenses = db.select().from(schema.expenses).all();
  const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);

  res.json({
    totalIncome,
    totalExpenses,
    profit: totalIncome - totalExpenses,
    orderCount: deliveredOrders.length,
  });
});

export default router;
