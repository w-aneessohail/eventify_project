import type { CookieOptions } from "express";
import { getConfig } from "../config/env";

const ACCESS_MAX_AGE = 24 * 60 * 60 * 1000;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function baseCookieOptions(): CookieOptions {
  const { cookie } = getConfig();
  return {
    httpOnly: true,
    sameSite: cookie.sameSite,
    secure: cookie.secure,
    path: "/",
  };
}

export function getAccessTokenCookieOptions(): CookieOptions {
  return {
    ...baseCookieOptions(),
    maxAge: ACCESS_MAX_AGE,
  };
}

export function getRefreshTokenCookieOptions(): CookieOptions {
  return {
    ...baseCookieOptions(),
    maxAge: REFRESH_MAX_AGE,
  };
}

export function getClearCookieOptions(): CookieOptions {
  return baseCookieOptions();
}
