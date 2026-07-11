import pino from "pino";
import { Request, Response, NextFunction } from "express";

export const logger = pino({
  transport: { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } },
});

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    logger.info({ method: req.method, url: req.originalUrl, status: res.statusCode, ms: Date.now() - start });
  });
  next();
}
