import { getStripeClient, getWebhookSecret } from './stripeClient';
import { storage } from './storage';
import type Stripe from 'stripe';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const stripe = getStripeClient();
    const webhookSecret = getWebhookSecret();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    console.log('Webhook event received:', event.type, 'ID:', event.id);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    console.log('Processing checkout.session.completed:', session.id);

    try {
      // Get orderId from metadata (not full order data)
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error('No orderId found in session metadata:', session.id);
        return;
      }

      // Check if order exists and get its details
      const order = await storage.getOrder(orderId);
      if (!order) {
        console.error('Order not found for orderId:', orderId);
        return;
      }

      // Validate payment status
      if (session.payment_status !== 'paid') {
        console.log('Payment not completed for session:', session.id);
        return;
      }

      // Check if already processed
      if (order.paymentStatus === ('paid' as const)) {
        console.log('Order already marked as paid:', orderId);
        return;
      }

      // Validate amount matches
      const stripeAmountAED = (session.amount_total || 0) / 100;
      const orderTotalAmount = parseFloat(order.totalAmount);

      if (Math.abs(stripeAmountAED - orderTotalAmount) > 0.01) {
        console.error(
          `Amount mismatch for session ${session.id}: Stripe=${stripeAmountAED}, Order=${orderTotalAmount}`
        );
        return;
      }

      // Update order to paid status
      await storage.updateOrderPaymentStatus(
        orderId,
        'paid',
        session.id,
        session.payment_intent as string
      );

      console.log('Order marked as paid:', orderId, 'Session:', session.id);

      // Update product stock
      if (order.orderItems) {
        for (const item of order.orderItems) {
          const product = await storage.getProduct(item.productId);
          if (product) {
            await storage.updateProduct(product.id, {
              stock: Math.max(0, product.stock - item.quantity),
            });
          }
        }
        console.log('Product stock updated for order:', orderId);
      }
    } catch (error: any) {
      console.error('Error handling checkout.session.completed:', error);
      throw error;
    }
  }

  private static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Payment intent succeeded:', paymentIntent.id);
    // Additional logic if needed
  }

  private static async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Payment intent failed:', paymentIntent.id);
    // Additional logic if needed (e.g., send notification)
  }
}
