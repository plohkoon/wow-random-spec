import { db } from "~/lib/db.server";
import { RaiderIOClient } from "~/lib/raiderIO";
import type { CharacterNS } from "~/lib/raiderIO/characters";
import { upsertRunsForPlayer, upsertPlayerProfile } from "~/lib/runData.server";
import { SYNC_PLAYER_DELAY_MS } from "~/lib/env.server";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Syncs a single player: fetches profile + runs from RaiderIO,
 * upserts runs (filtered by dateRange) and caches the profile.
 */
export async function syncPlayer(
  player: { id: string; playerName: string; playerServer: string },
  dateRange?: { after?: Date | null; before?: Date | null }
): Promise<{ runsUpserted: number }> {
  const client = RaiderIOClient.getInstance();

  const profile = await client.character.getCharacterProfile({
    region: "us",
    realm: player.playerServer,
    name: player.playerName,
    fields: {
      gear: true,
      mythic_plus_best_runs: { all: true },
      mythic_plus_alternate_runs: { all: true },
      mythic_plus_highest_level_runs: true,
      mythic_plus_recent_runs: true,
      mythic_plus_previous_weekly_highest_level_runs: true,
      mythic_plus_weekly_highest_level_runs: true,
    },
  });

  const allRuns: CharacterNS.MythicPlusRun[] = [
    ...(profile.mythic_plus_best_runs ?? []),
    ...(profile.mythic_plus_alternate_runs ?? []),
    ...(profile.mythic_plus_highest_level_runs ?? []),
    ...(profile.mythic_plus_recent_runs ?? []),
    ...(profile.mythic_plus_previous_weekly_highest_level_runs ?? []),
    ...(profile.mythic_plus_weekly_highest_level_runs ?? []),
  ];

  // Deduplicate by keystone_run_id
  const uniqueRuns = new Map<number, CharacterNS.MythicPlusRun>();
  for (const run of allRuns) {
    uniqueRuns.set(run.keystone_run_id, run);
  }

  const runsUpserted = await upsertRunsForPlayer(
    player.id,
    Array.from(uniqueRuns.values()),
    dateRange
  );

  await upsertPlayerProfile(player.id, profile);

  return { runsUpserted };
}

/**
 * Syncs all players for a single event.
 * Creates a SyncLog entry and returns when complete.
 *
 * If the event's end date has passed, the sync still runs (final sync)
 * and then the event status is set to ENDED.
 * Pass `force: true` (admin panel) to sync even if already ENDED.
 */
export async function syncEvent(
  eventId: string,
  options?: { force?: boolean }
): Promise<void> {
  const force = options?.force ?? false;

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: { players: true },
  });

  if (!event) {
    throw new Error(`Event ${eventId} not found`);
  }

  const isExpired = event.endDate != null && event.endDate < new Date();

  // If already ENDED and not forced, skip entirely
  if (event.status === "ENDED" && !force) {
    console.log(
      `[Sync] Skipping ended event "${event.name}" (use force to override)`
    );
    return;
  }

  const startedAt = new Date();
  let playersSynced = 0;
  let runsUpserted = 0;
  let hasErrors = false;
  let errorMessages: string[] = [];

  const syncLog = await db.syncLog.create({
    data: {
      eventId: event.id,
      status: "RUNNING",
      startedAt,
    },
  });

  const dateRange = {
    after: event.startDate,
    before: event.endDate,
  };

  console.log(
    `[Sync] Starting sync for event "${event.name}" (${event.players.length} players)`
  );

  for (const player of event.players) {
    if (!player.playerName || !player.playerServer) {
      continue;
    }

    try {
      const result = await syncPlayer(
        {
          id: player.id,
          playerName: player.playerName,
          playerServer: player.playerServer,
        },
        dateRange
      );
      runsUpserted += result.runsUpserted;
      playersSynced++;

      console.log(
        `[Sync]   ${player.playerName}-${player.playerServer}: ${result.runsUpserted} runs upserted, profile cached`
      );
    } catch (err) {
      hasErrors = true;
      const msg = `${player.playerName}-${player.playerServer}: ${err instanceof Error ? err.message : String(err)}`;
      errorMessages.push(msg);
      console.error(`[Sync]   Error for ${msg}`);
    }

    if (SYNC_PLAYER_DELAY_MS > 0) {
      await delay(SYNC_PLAYER_DELAY_MS);
    }
  }

  const completedAt = new Date();
  const durationMs = completedAt.getTime() - startedAt.getTime();

  await db.syncLog.update({
    where: { id: syncLog.id },
    data: {
      status: hasErrors
        ? playersSynced > 0
          ? "PARTIAL"
          : "FAILED"
        : "COMPLETED",
      playersSynced,
      runsUpserted,
      errorMessage:
        errorMessages.length > 0 ? errorMessages.join("; ") : null,
      completedAt,
      durationMs,
    },
  });

  console.log(
    `[Sync] Completed sync for "${event.name}": ${playersSynced} players, ${runsUpserted} runs in ${durationMs}ms${hasErrors ? " (with errors)" : ""}`
  );

  // If the event has expired, mark it as ENDED after the final sync
  if (isExpired && event.status === "ACTIVE") {
    await db.event.update({
      where: { id: event.id },
      data: { status: "ENDED" },
    });
    console.log(
      `[Sync] Event "${event.name}" has passed its end date, status set to ENDED`
    );
  }
}

/**
 * Syncs M+ run data for all active events.
 * Fetches from RaiderIO API and persists to the database.
 */
export async function syncActiveEvents(): Promise<void> {
  const activeEvents = await db.event.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
  });

  if (activeEvents.length === 0) {
    console.log("[Sync] No active events to sync");
    return;
  }

  for (const event of activeEvents) {
    await syncEvent(event.id);
  }
}
