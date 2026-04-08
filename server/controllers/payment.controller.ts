import type { Request, Response } from "express";
import { storage } from "../storage";
import { createPaymentIntent } from "../services/ziina.service";

export async function createZiinaPayment(req: Request, res: Response) {
  try {
    const userId = req.session.userId;
    const { orderId } = req.body as { orderId?: string };

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== userId) {
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
    const successUrl = `${baseUrl}/payment-success?orderId=${order.id}`;
    const cancelUrl = `${baseUrl}/dashboard/orders/${order.id}`;

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

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== userId) {
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
