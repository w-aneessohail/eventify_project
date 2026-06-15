/**
 * Smoke test for Safepay hosted checkout session creation.
 * Usage: npx ts-node scripts/verify-safepay-checkout.ts
 *
 * Requires SAFEPAY_PUBLIC_KEY, SAFEPAY_SECRET_KEY, SAFEPAY_WEBHOOK_SECRET in .env
 */
import * as dotenv from "dotenv";
dotenv.config();

import { SafepayService } from "../src/service/safepay.service";

async function main() {
  const result = await SafepayService.createHostedCheckout({
    bookingId: 99999,
    amountPkr: 100,
  });

  if (!result.checkoutUrl?.includes("sandbox.api.getsafepay.com")) {
    throw new Error(`Unexpected checkout URL: ${result.checkoutUrl}`);
  }
  if (!result.trackerToken?.startsWith("track_")) {
    throw new Error(`Unexpected tracker token: ${result.trackerToken}`);
  }

  console.log("✓ Safepay session created");
  console.log("  tracker:", result.trackerToken);
  console.log("  checkout URL host: sandbox.api.getsafepay.com");
  console.log("\nVERIFY SAFEPAY CHECKOUT: SUCCESS");
}

main().catch((err) => {
  console.error("VERIFY SAFEPAY CHECKOUT: FAILED");
  console.error(err?.message || err);
  process.exit(1);
});
