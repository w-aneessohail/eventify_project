/**
 * Resets known seed entities to expected verification states.
 * Safe to run before verify-approval when QA has drifted the dev database.
 * Usage: npx ts-node scripts/repair-seed-state.ts
 */
import dataSource from "../src/data-source";
import { repairSeedState } from "./repair-seed-state-lib";

async function main() {
  await dataSource.initialize();
  await repairSeedState(dataSource);
  console.log("✓ Seed verification state repaired");
  console.log("\nREPAIR SEED STATE: SUCCESS");
  await dataSource.destroy();
}

main().catch(async (err) => {
  console.error("REPAIR SEED STATE: FAILED");
  console.error(err?.message || err);
  try {
    await dataSource.destroy();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
