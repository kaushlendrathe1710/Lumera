import Stripe from 'stripe';

// Production-ready Stripe client for Railway deployment
// Uses environment variables instead of Replit connectors

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    stripeClient = new Stripe(secretKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }

  return stripeClient;
}

export function getStripePublishableKey(): string {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('STRIPE_PUBLISHABLE_KEY environment variable is not set');
  }

  return publishableKey;
}

export function getWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
  }

  return webhookSecret;
}

// Backward compatibility aliases
export const getUncachableStripeClient = getStripeClient;
export const getStripeSecretKey = () => process.env.STRIPE_SECRET_KEY || '';
