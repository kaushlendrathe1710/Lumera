import type { Express } from "express";
import { createZiinaPayment, getZiinaPaymentStatus } from "../controllers/payment.controller";

export function registerPaymentRoutes(
  app: Express,
) {
  app.post("/api/payments/create", createZiinaPayment);
  app.get("/api/payments/status/:orderId", getZiinaPaymentStatus);
}
