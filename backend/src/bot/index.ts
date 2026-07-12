import { Bot, InlineKeyboard } from "grammy";
import { config } from "../config";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { logger } from "../middleware/logger";
import type { OrderStatus } from "@grocery/shared";

export const bot = new Bot(config.BOT_TOKEN);
bot.catch((err) => logger.warn({ err: err.message }, "Bot error"));

bot.on("message:text", async (ctx) => {
  const id = ctx.from?.id;
  if (!id) return;

  const user = db.select().from(schema.users).where(eq(schema.users.telegramId, id)).get();
  if (!user) return;

  if (config.ADMIN_IDS.includes(id)) return;

  for (const adminId of config.ADMIN_IDS) {
    try {
      await bot.api.sendMessage(
        adminId,
        `💬 *Mijozdan xabar*\n\nIsm: ${user.name}\n@${ctx.from?.username || "username yo'q"}\n\n${ctx.message.text}`,
        { parse_mode: "Markdown" }
      );
    } catch {
      // skip failed delivery
    }
  }

  await ctx.reply("Xabaringiz adminga yuborildi. Javobni kuting.");
});

bot.command("start", async (ctx) => {
  const id = ctx.from?.id;
  if (!id) return;

  const existing = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.telegramId, id))
    .get();

  if (!existing) {
    db.insert(schema.users)
      .values({ telegramId: id, name: ctx.from?.first_name || "", isAdmin: config.ADMIN_IDS.includes(id) })
      .run();
  }

  const isAdmin = config.ADMIN_IDS.includes(id);
  const url = isAdmin ? `${config.APP_URL}/admin` : config.APP_URL;

  await ctx.reply("Xush kelibsiz! Do'konga kirish tugmani bosing 👇", {
    reply_markup: new InlineKeyboard().webApp(isAdmin ? "Admin panel" : "Do'konga kirish", url),
  });
});

const STATUS_LABELS: Record<OrderStatus, string> = {
  yangi: "🆕 Yangi",
  tayyorlanmoqda: "👨‍🍳 Tayyorlanmoqda",
  yetkazildi: "✅ Yetkazildi",
  bekor_qilindi: "❌ Bekor qilindi",
};

export async function notifyNewOrder(order: { id: number; total: number; userId: number }) {
  const user = db.select().from(schema.users).where(eq(schema.users.id, order.userId)).get();
  if (!user) return;

  for (const adminId of config.ADMIN_IDS) {
    try {
      await bot.api.sendMessage(
        adminId,
        `🆕 *Yangi buyurtma #${order.id}*\n\nMijoz: ${user.name}\nSumma: ${order.total.toLocaleString()} so'm\n\nAdmin panelni oching: ${config.APP_URL}/admin`,
        { parse_mode: "Markdown", reply_markup: new InlineKeyboard().webApp("Admin panel", `${config.APP_URL}/admin`) }
      );
    } catch (e) {
      console.error(`Failed to notify admin ${adminId}:`, e);
    }
  }
}

export async function notifyStatusChange(orderId: number, status: OrderStatus, userId: number, cancelReason?: string) {
  const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  if (!user) return;

  let message = `📋 Buyurtma #${orderId}\nHolat: ${STATUS_LABELS[status]}`;
  if (status === "bekor_qilindi" && cancelReason) {
    message += `\nSabab: ${cancelReason}`;
  }

  try {
    if (!user.telegramId) return;
    await bot.api.sendMessage(user.telegramId, message, {
      reply_markup: new InlineKeyboard().webApp("Do'konga kirish", config.APP_URL),
    });
  } catch (e) {
    console.error(`Failed to notify user ${user.telegramId}:`, e);
  }
}

export function startBot() {
  if (config.isDev || !config.BOT_TOKEN || config.BOT_TOKEN === "dev_token_placeholder") {
    logger.info("Bot skipped (dev mode / no token)");
    return;
  }
  bot.start()
    .then(() => logger.info("Bot started"))
    .catch((err) => logger.warn({ err: err.message }, "Bot failed to start"));
}
