import "dotenv/config";
import "./middleware/auth";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config";
import { logger, requestLogger } from "./middleware/logger";
import { errorHandler } from "./middleware/error";
import { startBot } from "./bot";
import productsRouter from "./routes/products";
import ordersRouter from "./routes/orders";
import cartRouter from "./routes/cart";
import expensesRouter from "./routes/expenses";
import financeRouter from "./routes/finance";
import authRouter from "./routes/auth";
import uploadRouter from "./routes/upload";
import categoriesRouter from "./routes/categories";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({
  origin: config.isDev ? "*" : [config.APP_URL, "https://t.me"],
  credentials: true,
}));
app.use(express.json());
app.use(requestLogger);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.get("/api/config", (_, res) => res.json({ deliveryFee: config.DELIVERY_FEE }));

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/cart", cartRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/finance", financeRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/upload", uploadRouter);

app.use(errorHandler);

app.listen(config.PORT, () => {
  logger.info(`Server running on http://localhost:${config.PORT}`);
  startBot();
});
