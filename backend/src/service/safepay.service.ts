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

/** Safepay metadata fields may be plain strings or { key, value } objects. */
function readMetadataField(
  metadata: Record<string, unknown>,
  key: string
): unknown {
  const raw = metadata[key];
  if (raw && typeof raw === "object" && raw !== null) {
    const entry = raw as Record<string, unknown>;
    if ("value" in entry) return entry.value;
  }
  return raw;
}

function bookingIdFromMetadata(metadata: unknown): number | null {
  if (!metadata || typeof metadata !== "object") return null;
  const record = metadata as Record<string, unknown>;

  for (const key of ["order_id", "booking_id", "orderId", "bookingId"]) {
    const id = parseBookingId(readMetadataField(record, key));
    if (id) return id;
  }

  for (const value of Object.values(record)) {
    if (!value || typeof value !== "object") continue;
    const entry = value as Record<string, unknown>;
    if (
      (entry.key === "order_id" || entry.key === "booking_id") &&
      "value" in entry
    ) {
      const id = parseBookingId(entry.value);
      if (id) return id;
    }
  }

  if (record.data && typeof record.data === "object") {
    return bookingIdFromMetadata(record.data);
  }

  return null;
}

function extractTracker(raw: unknown): string | null {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (raw && typeof raw === "object" && raw !== null) {
    const token = (raw as { token?: unknown }).token;
    if (typeof token === "string" && token.trim()) return token.trim();
  }
  return null;
}

function isPaymentSuccessEvent(
  eventType: string,
  state: string,
  flags: { success?: unknown }
): boolean {
  const normalizedType = eventType.toLowerCase();
  const normalizedState = state.toUpperCase();

  if (
    normalizedType === "payment.succeeded" ||
    normalizedType === "payment.completed" ||
    normalizedType === "payment:created" ||
    normalizedType === "payment:completed" ||
    normalizedType === "payment:settled"
  ) {
    return true;
  }

  if (flags.success === true) return true;
  if (normalizedState === "PAID" || normalizedState === "TRACKER_ENDED") {
    return true;
  }

  return false;
}

function collectBookingIdFromRecord(
  record: Record<string, unknown>
): number | null {
  const fromMeta = bookingIdFromMetadata(record.metadata);
  if (fromMeta) return fromMeta;

  for (const key of ["order_id", "orderId", "reference", "booking_id"]) {
    const id = parseBookingId(record[key]);
    if (id) return id;
  }

  return null;
}

function collectBookingIdCandidates(
  body: Record<string, unknown>,
  ...objects: unknown[]
): number | null {
  for (const obj of objects) {
    if (!obj || typeof obj !== "object") continue;
    const id = collectBookingIdFromRecord(obj as Record<string, unknown>);
    if (id) return id;
  }

  const topLevel = collectBookingIdFromRecord(body);
  if (topLevel) return topLevel;

  const order = body.order;
  if (order && typeof order === "object") {
    const id = bookingIdFromMetadata(
      (order as Record<string, unknown>).metadata
    );
    if (id) return id;
  }

  const data = body.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const dataOrder = (data as Record<string, unknown>).order;
    if (dataOrder && typeof dataOrder === "object") {
      const id = bookingIdFromMetadata(
        (dataOrder as Record<string, unknown>).metadata
      );
      if (id) return id;
    }
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
  rawMetadata: unknown;
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
      const detail =
        Array.isArray(errors) && errors.length > 0
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
      typeof passportData === "string" ? passportData : passportData?.token;

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
   * Fallback when webhook payload omits order_id — fetch tracker from Safepay reporter API.
   */
  static async fetchTrackerBookingId(
    trackerToken: string
  ): Promise<number | null> {
    const config = getSafepayConfig();
    const path = `/reporter/api/v1/payments/${encodeURIComponent(trackerToken)}`;

    try {
      const response = await fetch(`${config.apiHost}${path}`, {
        headers: {
          Accept: "application/json",
          "x-sfpy-merchant-secret": config.secretKey,
        },
      });

      if (!response.ok) return null;

      const json = (await response.json()) as {
        data?: { metadata?: unknown; state?: string };
      };

      return bookingIdFromMetadata(json.data?.metadata);
    } catch {
      return null;
    }
  }

  /**
   * Verifies Safepay webhook signatures.
   *
   * V2 (Webhook Logs V2): HMAC-SHA256 over `timestamp + '.' + raw_body`,
   * header `sha256=<hex>`.
   *
   * Legacy (sfpy-php): HMAC-SHA512 over raw body, bare 128-char hex header.
   */
  static verifyWebhookSignature(
    rawBody: Buffer,
    signatureHeader?: string,
    timestampHeader?: string
  ):
    | { ok: true }
    | {
        ok: false;
        reason:
          | "missing_secret"
          | "missing_signature"
          | "invalid_signature";
      } {
    const secret = getSafepayConfig().webhookSecret;
    if (!secret) {
      return { ok: false, reason: "missing_secret" };
    }

    if (!signatureHeader?.trim()) {
      return { ok: false, reason: "missing_signature" };
    }

    const rawBodyUtf8 = rawBody.toString("utf8");
    const trimmedHeader = signatureHeader.trim();
    const trimmedTimestamp = timestampHeader?.trim();

    if (
      trimmedHeader.toLowerCase().startsWith("sha256=") &&
      trimmedTimestamp
    ) {
      const receivedHex = trimmedHeader.slice("sha256=".length);
      const signedPayload = `${trimmedTimestamp}.${rawBodyUtf8}`;
      const expected = crypto
        .createHmac("sha256", secret)
        .update(signedPayload, "utf8")
        .digest("hex");

      if (secureCompare(expected, receivedHex)) {
        return { ok: true };
      }

      return { ok: false, reason: "invalid_signature" };
    }

    const expected = crypto
      .createHmac("sha512", secret)
      .update(rawBodyUtf8, "utf8")
      .digest("hex");

    if (secureCompare(expected, trimmedHeader)) {
      return { ok: true };
    }

    return { ok: false, reason: "invalid_signature" };
  }

  static parseWebhookPayload(payload: unknown): ParsedSafepayWebhook {
    const body = (payload ?? {}) as Record<string, unknown>;
    const eventType = String(
      body.type ?? body.event_type ?? body.eventType ?? ""
    );

    const data = body.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const dataRecord = data as Record<string, unknown>;
      const state = String(dataRecord.state ?? "").toUpperCase();
      const bookingId = collectBookingIdCandidates(body, dataRecord);
      const tracker =
        extractTracker(dataRecord.tracker) ??
        extractTracker(dataRecord.token) ??
        extractTracker(body.tracker);

      return {
        eventType,
        isPaymentSuccess: isPaymentSuccessEvent(eventType, state, {
          success: dataRecord.success,
        }),
        bookingId,
        tracker,
        rawMetadata: dataRecord.metadata ?? null,
      };
    }

    const notification = body.notification;
    if (notification && typeof notification === "object") {
      const note = notification as Record<string, unknown>;
      const state = String(note.state ?? "").toUpperCase();
      const bookingId = collectBookingIdCandidates(body, note);
      const tracker =
        extractTracker(note.tracker) ?? extractTracker(body.tracker);

      return {
        eventType,
        isPaymentSuccess: isPaymentSuccessEvent(eventType, state, {
          success: note.success,
        }),
        bookingId,
        tracker,
        rawMetadata: note.metadata ?? null,
      };
    }

    const state = String(body.state ?? "").toUpperCase();
    return {
      eventType,
      isPaymentSuccess: isPaymentSuccessEvent(eventType, state, {
        success: body.success,
      }),
      bookingId: collectBookingIdCandidates(body, body),
      tracker: extractTracker(body.tracker),
      rawMetadata: body.metadata ?? null,
    };
  }
}
