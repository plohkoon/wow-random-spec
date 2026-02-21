import { SYNC_ENABLED, SYNC_INTERVAL_MS } from "~/lib/env.server";
import { syncActiveEvents } from "~/lib/sync.server";

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startScheduler(): void {
  if (!SYNC_ENABLED) {
    console.log("[Scheduler] Sync is disabled (SYNC_ENABLED=false)");
    return;
  }

  if (intervalId) {
    console.log("[Scheduler] Already running, skipping duplicate start");
    return;
  }

  console.log(
    `[Scheduler] Starting sync scheduler (interval: ${SYNC_INTERVAL_MS}ms)`
  );

  // Run immediately on startup
  syncActiveEvents().catch((err) => {
    console.error("[Scheduler] Initial sync failed:", err);
  });

  // Then run on interval
  intervalId = setInterval(() => {
    syncActiveEvents().catch((err) => {
      console.error("[Scheduler] Scheduled sync failed:", err);
    });
  }, SYNC_INTERVAL_MS);
}

export function stopScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("[Scheduler] Stopped");
  }
}
