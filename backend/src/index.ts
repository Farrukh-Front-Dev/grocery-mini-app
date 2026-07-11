import "dotenv/config";
import "./middleware/auth";
import express from "express";
import cors from "cors";
import { config } from "./config";
import { logger, requestLogger } from "./middleware/logger";
import { errorHandler } from "./middleware/error";
import { startBot } from "./bot";
import productsRouter from "./routes/products";
import ordersRouter from "./routes/orders";
import cartRouter from "./routes/cart";
import expensesRouter from "./routes/expenses";
import financeRouter from "./routes/finance";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/cart", cartRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/finance", financeRouter);

app.use(errorHandler);

app.listen(config.PORT, () => {
  logger.info(`Server running on http://localhost:${config.PORT}`);
  startBot();
});
