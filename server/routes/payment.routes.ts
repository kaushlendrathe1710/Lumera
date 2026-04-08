import type { Express, Request, Response, NextFunction } from "express";
import { createZiinaPayment, getZiinaPaymentStatus } from "../controllers/payment.controller";

export function registerPaymentRoutes(
  app: Express,
  requireAuth: (req: Request, res: Response, next: NextFunction) => void,
) {
  app.post("/api/payments/create", requireAuth, createZiinaPayment);
  app.get("/api/payments/status/:orderId", requireAuth, getZiinaPaymentStatus);
}
