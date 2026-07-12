import { Router } from "express";
import { db, schema } from "../db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, (_, res) => {
  const expenses = db
    .select()
    .from(schema.expenses)
    .orderBy(desc(schema.expenses.createdAt))
    .all();
  res.json(expenses);
});

const expenseSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
});

router.post("/", authMiddleware, adminMiddleware, (req, res) => {
  const parsed = expenseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  const expense = db
    .insert(schema.expenses)
    .values({
      description: parsed.data.description,
      amount: parsed.data.amount,
      createdByAdminId: req.userId!,
    })
    .returning()
    .get();

  res.json(expense);
});

router.patch("/:id", authMiddleware, adminMiddleware, (req, res) => {
  const parsed = expenseSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }
  db.update(schema.expenses)
    .set(parsed.data)
    .where(eq(schema.expenses.id, Number(req.params.id)))
    .run();
  res.json({ ok: true });
});

router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => {
  db.delete(schema.expenses).where(eq(schema.expenses.id, Number(req.params.id))).run();
  res.json({ ok: true });
});

export default router;
