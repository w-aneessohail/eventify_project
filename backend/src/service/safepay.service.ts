import * as crypto from "crypto";
import { getSafepayConfig } from "../config/safepay.config";

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function parseBookingId(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function bookingIdFromMetadata(metadata: Record<string, unknown>): number | null {
  const direct = parseBookingId(metadata.order_id ?? metadata.booking_id);
  if (direct) return direct;

  if (metadata.data && typeof metadata.data === "object") {
    const nested = metadata.data as Record<string, unknown>;
    return parseBookingId(nested.order_id ?? nested.booking_id);
  }

  return null;
}

export type SafepayCheckoutResult = {
  checkoutUrl: string;
  trackerToken: string;
};

export type ParsedSafepayWebhook = {
  eventType: string;
  isPaymentSuccess: boolean;
  bookingId: number | null;
  tracker: string | null;
};

const CHECKOUT_HOSTS = {
  sandbox: "https://sandbox.api.getsafepay.com/embedded/",
  production: "https://getsafepay.com/embedded/",
} as const;

export class SafepayService {
  private static async safepayRequest<T>(
    path: string,
    options: { method?: string; body?: unknown } = {}
  ): Promise<T> {
    const config = getSafepayConfig();
    const response = await fetch(`${config.apiHost}${path}`, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-sfpy-merchant-secret": config.secretKey,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const json = (await response.json()) as T & {
      status?: { message?: string; errors?: unknown[] };
    };

    if (!response.ok) {
      const errors = json?.status?.errors;
      const detail = Array.isArray(errors) && errors.length > 0
        ? errors.join("; ")
        : json?.status?.message;
      throw new Error(
        detail || `Safepay API error (${response.status}) on ${path}`
      );
    }

    return json;
  }

  static toMinorUnits(amountPkr: number): number {
    return Math.round(Number(amountPkr) * 100);
  }

  static buildCheckoutUrl(params: {
    environment: "sandbox" | "production";
    tracker: string;
    tbt: string;
    orderId: string;
    redirectUrl: string;
    cancelUrl: string;
  }): string {
    const base =
      params.environment === "production"
        ? CHECKOUT_HOSTS.production
        : CHECKOUT_HOSTS.sandbox;

    const query = new URLSearchParams({
      environment: params.environment,
      tracker: params.tracker,
      tbt: params.tbt,
      source: "hosted",
      order_id: params.orderId,
      redirect_url: params.redirectUrl,
      cancel_url: params.cancelUrl,
    });

    return `${base}?${query.toString()}`;
  }

  static async createHostedCheckout(input: {
    bookingId: number;
    amountPkr: number;
  }): Promise<SafepayCheckoutResult> {
    const config = getSafepayConfig();
    const amount = this.toMinorUnits(input.amountPkr);
    const frontendBase = config.frontendUrl.replace(/\/$/, "");

    const sessionResponse = await this.safepayRequest<{
      data?: { tracker?: { token?: string } };
    }>("/order/payments/v3/", {
      method: "POST",
      body: {
        merchant_api_key: config.publicKey,
        intent: "CYBERSOURCE",
        mode: "payment",
        entry_mode: "raw",
        currency: "PKR",
        amount,
        metadata: {
          order_id: String(input.bookingId),
        },
      },
    });

    const trackerToken = sessionResponse.data?.tracker?.token;
    if (!trackerToken) {
      throw new Error("Safepay did not return a tracker token");
    }

    const passportResponse = await this.safepayRequest<{
      data?: string | { token?: string };
    }>("/client/passport/v1/token", { method: "POST", body: {} });

    const passportData = passportResponse.data;
    const tbt =
      typeof passportData === "string"
        ? passportData
        : passportData?.token;

    if (!tbt) {
      throw new Error("Safepay did not return a passport token");
    }

    const checkoutUrl = this.buildCheckoutUrl({
      environment: config.environment,
      tracker: trackerToken,
      tbt,
      orderId: String(input.bookingId),
      redirectUrl: `${frontendBase}/attendee/payment/${input.bookingId}?status=return`,
      cancelUrl: `${frontendBase}/attendee/payment/${input.bookingId}?status=cancelled`,
    });

    return { checkoutUrl, trackerToken };
  }

  /**
   * Safepay hosted checkout webhooks use HMAC-SHA512 over the raw JSON body
   * with the webhook secret from the Safepay dashboard (sfpy-php SDK scheme).
   */
  static verifyWebhookSignature(
    rawBody: Buffer,
    signatureHeader: string | undefined
  ): boolean {
    if (!signatureHeader?.trim()) return false;

    const secret = getSafepayConfig().webhookSecret;
    const payload = rawBody.toString("utf8");
    const expected = crypto
      .createHmac("sha512", secret)
      .update(payload, "utf8")
      .digest("hex");

    return secureCompare(expected, signatureHeader.trim());
  }

  static parseWebhookPayload(payload: unknown): ParsedSafepayWebhook {
    const body = (payload ?? {}) as Record<string, unknown>;
    const eventType = String(body.type ?? body.event_type ?? "");

    if (body.data && typeof body.data === "object") {
      const data = body.data as Record<string, unknown>;
      const metadata = (data.metadata ?? {}) as Record<string, unknown>;
      const bookingId =
        bookingIdFromMetadata(metadata) ??
        parseBookingId(data.order_id ?? metadata.order_id);
      const tracker = String(data.tracker ?? data.token ?? "") || null;
      const state = String(data.state ?? "").toUpperCase();
      const isPaymentSuccess =
        eventType === "payment.succeeded" ||
        eventType === "payment.completed" ||
        data.success === true ||
        state === "PAID" ||
        state === "TRACKER_ENDED";

      return { eventType, isPaymentSuccess, bookingId, tracker };
    }

    if (body.notification && typeof body.notification === "object") {
      const notification = body.notification as Record<string, unknown>;
      const metadata = (notification.metadata ?? {}) as Record<string, unknown>;
      const bookingId =
        bookingIdFromMetadata(metadata) ??
        parseBookingId(notification.reference ?? body.order_id);
      const tracker = String(notification.tracker ?? "") || null;
      const state = String(notification.state ?? "").toUpperCase();
      const isPaymentSuccess =
        eventType === "payment.succeeded" ||
        eventType === "payment:created" ||
        state === "PAID";

      return { eventType, isPaymentSuccess, bookingId, tracker };
    }

    return {
      eventType,
      isPaymentSuccess: false,
      bookingId: null,
      tracker: null,
    };
  }
}
