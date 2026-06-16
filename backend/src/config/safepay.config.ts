export type SafepayConfig = {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  environment: "sandbox" | "production";
  apiHost: string;
  frontendUrl: string;
};

let cachedSafepayConfig: SafepayConfig | null = null;

function requireSafepayEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required Safepay environment variable: ${key}`);
  }
  return value.trim();
}

export function getSafepayConfig(): SafepayConfig {
  if (cachedSafepayConfig) return cachedSafepayConfig;

  const environment =
    (process.env.SAFEPAY_ENV?.trim().toLowerCase() || "sandbox") === "production"
      ? "production"
      : "sandbox";

  const apiHost =
    environment === "production"
      ? "https://api.getsafepay.com"
      : "https://sandbox.api.getsafepay.com";

  const frontendUrl =
    process.env.FRONTEND_URL?.trim() ||
    process.env.CORS_ORIGINS?.split(",")[0]?.trim() ||
    "http://localhost:5173";

  cachedSafepayConfig = {
    publicKey: requireSafepayEnv("SAFEPAY_PUBLIC_KEY"),
    secretKey: requireSafepayEnv("SAFEPAY_SECRET_KEY"),
    webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET?.trim() || "",
    environment,
    apiHost,
    frontendUrl,
  };

  return cachedSafepayConfig;
}
