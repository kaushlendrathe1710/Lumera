import type { Request, Response } from "express";
import { storage } from "../storage";
import { getPaymentIntent } from "../services/ziina.service";

function extractPaymentIntentId(payload: any): string | undefined {
  return (
    payload?.payment_intent_id ||
    payload?.payment_intent?.id ||
    payload?.data?.payment_intent_id ||
    payload?.data?.id ||
    payload?.data?.payment_intent?.id
  );
}

export async function handleZiinaWebhook(req: Request, res: Response) {
  // Webhooks should never bubble errors and should always acknowledge delivery.
  try {
    const rawBody = req.body as Buffer;
    const payload = JSON.parse(rawBody.toString("utf-8"));

    if (payload?.event !== "payment_intent.status.updated" && payload?.type !== "payment_intent.status.updated") {
      return res.status(200).json({ received: true });
    }

    const paymentIntentId = extractPaymentIntentId(payload);
    if (!paymentIntentId) {
      console.error("Ziina webhook missing payment_intent_id", payload);
      return res.status(200).json({ received: true });
    }

    const order = await storage.getOrderByZiinaPaymentIntentId(paymentIntentId);
    if (!order) {
      console.error("No order found for Ziina payment intent", paymentIntentId);
      return res.status(200).json({ received: true });
    }

    // Idempotency: terminal payment states should not be re-processed.
    if (order.paymentStatus === "paid" || order.paymentStatus === "failed") {
      return res.status(200).json({ received: true });
    }

    const latestPaymentIntent = await getPaymentIntent(paymentIntentId);

    if (latestPaymentIntent.status === "completed") {
      await storage.updateOrderPaymentStatus(
        order.id,
        "paid",
        paymentIntentId,
        JSON.stringify(payload),
        true,
      );
      return res.status(200).json({ received: true, processed: "paid" });
    }

    if (latestPaymentIntent.status === "failed" || latestPaymentIntent.status === "canceled") {
      await storage.updateOrderPaymentStatus(
        order.id,
        "failed",
        paymentIntentId,
        JSON.stringify(payload),
        false,
      );
      return res.status(200).json({ received: true, processed: "failed" });
    }

    await storage.updateOrderPaymentStatus(
      order.id,
      "pending",
      paymentIntentId,
      JSON.stringify(payload),
      false,
    );

    return res.status(200).json({ received: true, processed: "pending" });
  } catch (error) {
    console.error("Ziina webhook processing error:", error);
    return res.status(200).json({ received: true });
  }
}
