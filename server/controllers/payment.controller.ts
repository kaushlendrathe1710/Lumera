import type { Request, Response } from "express";
import { storage } from "../storage";
import { createPaymentIntent } from "../services/ziina.service";

function canAccessOrder(order: any, sessionUserId?: string, accessToken?: string): boolean {
  if (sessionUserId && order.userId === sessionUserId) {
    return true;
  }
  if (accessToken && order.guestAccessToken && accessToken === order.guestAccessToken) {
    return true;
  }
  return false;
}

export async function createZiinaPayment(req: Request, res: Response) {
  try {
    const userId = req.session.userId;
    const { orderId, accessToken } = req.body as { orderId?: string; accessToken?: string };

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!canAccessOrder(order, userId, accessToken)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(409).json({ error: "Order is already paid" });
    }

    const amount = Math.round(parseFloat(order.totalAmount) * 100);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid order amount" });
    }

    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
    const accessQuery = order.guestAccessToken
      ? `&access=${encodeURIComponent(order.guestAccessToken)}`
      : "";
    const successUrl = `${baseUrl}/payment-success?orderId=${order.id}${accessQuery}`;
    const cancelUrl = `${baseUrl}/checkout?orderId=${order.id}${accessQuery}`;

    const paymentIntent = await createPaymentIntent({
      amount,
      currencyCode: "AED",
      successUrl,
      cancelUrl,
      failureUrl: cancelUrl,
      test: true,
      message: `Payment for order ${order.orderNumber}`,
    });

    if (!paymentIntent.redirect_url) {
      throw new Error("Ziina did not return redirect_url");
    }

    await storage.updateOrderPaymentStatus(
      order.id,
      "pending",
      paymentIntent.id,
      undefined,
      false,
    );

    return res.json({
      orderId: order.id,
      paymentIntentId: paymentIntent.id,
      redirect_url: paymentIntent.redirect_url,
    });
  } catch (error) {
    console.error("Create Ziina payment error:", error);
    return res.status(500).json({ error: "Failed to create payment intent" });
  }
}

export async function getZiinaPaymentStatus(req: Request, res: Response) {
  try {
    const userId = req.session.userId;
    const orderId = req.params.orderId as string;
    const accessToken = req.query.access as string | undefined;

    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!canAccessOrder(order, userId, accessToken)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json({
      order,
      paymentStatus: order.paymentStatus,
      isPaid: order.paymentStatus === "paid",
    });
  } catch (error) {
    console.error("Get Ziina payment status error:", error);
    return res.status(500).json({ error: "Failed to fetch payment status" });
  }
}
