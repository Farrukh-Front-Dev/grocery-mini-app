import { Bot, InlineKeyboard } from "grammy";
import { config } from "../config";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";

export const bot = new Bot(config.BOT_TOKEN);

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
      .values({
        telegramId: id,
        name: ctx.from?.first_name || "",
        isAdmin: config.ADMIN_IDS.includes(id),
      })
      .run();
  }

  const isAdmin = config.ADMIN_IDS.includes(id);
  const url = isAdmin ? `${config.APP_URL}/admin` : config.APP_URL;

  await ctx.reply("Xush kelibsiz! Do'konga kirish 👇", {
    reply_markup: new InlineKeyboard().webApp(
      isAdmin ? "Admin panel" : "Do'konga kirish",
      url
    ),
  });
});

export function startBot() {
  bot.start();
  console.log("Bot started");
}
