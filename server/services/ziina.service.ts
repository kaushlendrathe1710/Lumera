import crypto from "crypto";

const ZIINA_API_BASE_URL = "https://api-v2.ziina.com/api";

type ZiinaPaymentIntentStatus =
  | "requires_payment_instrument"
  | "requires_user_action"
  | "pending"
  | "completed"
  | "failed"
  | "canceled";

export interface CreateZiinaPaymentIntentInput {
  amount: number;
  currencyCode: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl?: string;
  message?: string;
  test?: boolean;
}

export interface ZiinaPaymentIntent {
  id: string;
  amount: number;
  currency_code: string;
  status: ZiinaPaymentIntentStatus;
  redirect_url?: string;
  success_url?: string;
  cancel_url?: string;
  latest_error?: {
    message?: string;
    code?: string;
  };
}

export interface CreateZiinaTransferInput {
  operationId: string;
  amount: number;
  currencyCode: string;
  toAccountIds?: string[];
  toZiinames?: string[];
  message?: string;
}

function getZiinaApiToken(): string {
  const token = process.env.ZIINA_API_KEY || process.env.ZINNA_API_TOKEN;
  if (!token) {
    throw new Error("ZIINA API token is not configured");
  }
  return token;
}

function getZiinaWebhookSecret(): string {
  const secret = process.env.ZIINA_WEBHOOK_SECRET || process.env.ZINNA_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("ZIINA webhook secret is not configured");
  }
  return secret;
}

async function ziinaRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${ZIINA_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getZiinaApiToken()}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const bodyText = await response.text();
  const payload = bodyText ? JSON.parse(bodyText) : {};

  if (!response.ok) {
    throw new Error(`Ziina API request failed (${response.status}): ${payload?.error || bodyText || "Unknown error"}`);
  }

  return payload as T;
}

export async function createPaymentIntent(input: CreateZiinaPaymentIntentInput): Promise<ZiinaPaymentIntent> {
  return ziinaRequest<ZiinaPaymentIntent>("/payment_intent", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amount,
      currency_code: input.currencyCode,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      failure_url: input.failureUrl,
      message: input.message,
      test: input.test,
    }),
  });
}

export async function getPaymentIntent(paymentIntentId: string): Promise<ZiinaPaymentIntent> {
  return ziinaRequest<ZiinaPaymentIntent>(`/payment_intent/${paymentIntentId}`, {
    method: "GET",
  });
}

export async function createTransfer(input: CreateZiinaTransferInput): Promise<unknown> {
  return ziinaRequest<unknown>("/transfer", {
    method: "POST",
    body: JSON.stringify({
      operation_id: input.operationId,
      to_account_ids: input.toAccountIds,
      to_ziinames: input.toZiinames,
      amount: input.amount,
      currency_code: input.currencyCode,
      message: input.message,
    }),
  });
}

export function verifyZiinaWebhookSignature(rawBody: Buffer, headerSignature: string): boolean {
  const computedHex = crypto
    .createHmac("sha256", getZiinaWebhookSecret())
    .update(rawBody)
    .digest("hex");

  const cleanedHeader = headerSignature.startsWith("sha256=")
    ? headerSignature.slice("sha256=".length)
    : headerSignature;

  const computedBuffer = Buffer.from(computedHex, "hex");
  const receivedBuffer = Buffer.from(cleanedHeader, "hex");

  if (computedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(computedBuffer, receivedBuffer);
}
