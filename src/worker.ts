/**
 * Background worker entry point.
 *
 * Run alongside the Next.js dev server:
 *   npx tsx src/worker.ts
 *
 * In production, deploy as a separate process.
 */

import { createQueueWorker } from "@/lib/queue";

console.log("[WORKER] Starting background job processor...");

createQueueWorker();

// Keep the process alive
process.on("SIGTERM", () => {
  console.log("[WORKER] Shutting down...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[WORKER] Shutting down...");
  process.exit(0);
});
