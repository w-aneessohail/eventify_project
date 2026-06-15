/** Map raw API/auth errors to user-friendly copy. */
export function getFriendlyErrorMessage(raw, context = "default") {
  const message =
    typeof raw === "string"
      ? raw
      : raw?.message || raw?.error || "";

  const normalized = String(message).toLowerCase();

  if (
    normalized.includes("invalid or revoked refresh token") ||
    normalized.includes("refresh token expired") ||
    normalized.includes("invalid refresh token")
  ) {
    return "Your session has expired. Please sign in again.";
  }

  if (normalized.includes("invalid credentials") || context === "login") {
    return "Invalid email or password.";
  }

  if (normalized.includes("email not verified")) {
    return "Please verify your email before signing in.";
  }

  if (normalized.includes("not enough tickets") || normalized.includes("sold out")) {
    return "This event is sold out or does not have enough tickets.";
  }

  if (normalized.includes("not available for booking")) {
    return "This event is not available for booking.";
  }

  if (normalized.includes("network error") || normalized === "network error") {
    return "Unable to reach the server. Check your connection and try again.";
  }

  if (normalized.includes("forbidden")) {
    return "You do not have permission to perform this action.";
  }

  if (normalized.includes("unauthorized")) {
    return "Please sign in to continue.";
  }

  if (message && message.length < 200) {
    return message;
  }

  return "Something went wrong. Please try again.";
}
