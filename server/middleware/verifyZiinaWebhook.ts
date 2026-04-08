import type { Request, Response, NextFunction } from "express";
import { verifyZiinaWebhookSignature } from "../services/ziina.service";

export function verifyZiinaWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const signature = req.header("X-Hmac-Signature");
    if (!signature) {
      return res.status(401).json({ error: "Missing X-Hmac-Signature" });
    }

    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({ error: "Webhook body must be raw" });
    }

    // Verify webhook authenticity using HMAC SHA256 over raw body.
    const valid = verifyZiinaWebhookSignature(req.body as Buffer, signature);
    if (!valid) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    next();
  } catch (error) {
    console.error("Ziina webhook verification failed:", error);
    return res.status(401).json({ error: "Webhook verification failed" });
  }
}
