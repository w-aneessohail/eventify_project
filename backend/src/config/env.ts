export type AppConfig = {
  nodeEnv: string;
  isProd: boolean;
  isDev: boolean;
  port: number;
  jwtSecret: string;
  saltRounds: number;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
  corsOrigins: string[];
  cookie: {
    secure: boolean;
    sameSite: "lax" | "strict" | "none";
  };
  trustProxy: boolean;
  bodyLimitJson: string;
  bodyLimitUrlencoded: string;
  rateLimitAuth: {
    windowMs: number;
    max: number;
  };
  logLevel: string;
};

let cachedConfig: AppConfig | null = null;

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
}

function parsePositiveInt(value: string, key: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }
  return parsed;
}

const WEAK_JWT_SECRETS = new Set([
  "secret",
  "change_me_to_a_long_random_string",
  "jwt_secret",
]);

export function loadConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const nodeEnv = process.env.NODE_ENV?.trim() || "development";
  const isProd = nodeEnv === "production";
  const isDev = !isProd;

  const jwtSecret = requireEnv("JWT_SECRET");
  if (WEAK_JWT_SECRETS.has(jwtSecret) || jwtSecret.length < 16) {
    const msg = "JWT_SECRET is too weak. Use at least 16 random characters.";
    if (isProd) throw new Error(msg);
    console.warn(`[config] ${msg} (allowed in development only)`);
  }
  if (isProd && jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }

  const corsRaw = process.env.CORS_ORIGINS?.trim();
  let corsOrigins: string[];
  if (corsRaw) {
    corsOrigins = corsRaw
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  } else if (isDev) {
    corsOrigins = ["http://localhost:5173"];
    console.warn(
      "[config] CORS_ORIGINS not set — using http://localhost:5173 (development only)"
    );
  } else {
    throw new Error("CORS_ORIGINS is required in production");
  }

  if (corsOrigins.some((origin) => origin === "*")) {
    throw new Error(
      "CORS_ORIGINS cannot use wildcard when credentials are enabled"
    );
  }

  const cookieSecure =
    process.env.COOKIE_SECURE === "true" || (isProd && process.env.COOKIE_SECURE !== "false");
  const sameSiteRaw = (process.env.COOKIE_SAME_SITE || (isProd ? "strict" : "lax")).toLowerCase();
  if (!["lax", "strict", "none"].includes(sameSiteRaw)) {
    throw new Error("COOKIE_SAME_SITE must be lax, strict, or none");
  }

  cachedConfig = {
    nodeEnv,
    isProd,
    isDev,
    port: parsePositiveInt(process.env.PORT || "5002", "PORT"),
    jwtSecret,
    saltRounds: parsePositiveInt(process.env.SALT_ROUNDS || "10", "SALT_ROUNDS"),
    db: {
      host: requireEnv("DB_HOST"),
      port: parsePositiveInt(requireEnv("DB_PORT"), "DB_PORT"),
      user: requireEnv("DB_USER"),
      password: requireEnv("DB_PASSWORD"),
      name: requireEnv("DB_NAME"),
    },
    corsOrigins,
    cookie: {
      secure: cookieSecure,
      sameSite: sameSiteRaw as AppConfig["cookie"]["sameSite"],
    },
    trustProxy: process.env.TRUST_PROXY === "true",
    bodyLimitJson: process.env.BODY_LIMIT_JSON?.trim() || "1mb",
    bodyLimitUrlencoded: process.env.BODY_LIMIT_URLENCODED?.trim() || "1mb",
    rateLimitAuth: {
      windowMs: parsePositiveInt(
        process.env.RATE_LIMIT_AUTH_WINDOW_MS || "900000",
        "RATE_LIMIT_AUTH_WINDOW_MS"
      ),
      max: parsePositiveInt(process.env.RATE_LIMIT_AUTH_MAX || "20", "RATE_LIMIT_AUTH_MAX"),
    },
    logLevel: process.env.LOG_LEVEL?.trim() || "info",
  };

  return cachedConfig;
}

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    throw new Error("Configuration not loaded. Import config/bootstrap first.");
  }
  return cachedConfig;
}
