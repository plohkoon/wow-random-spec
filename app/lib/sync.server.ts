import { db } from "~/lib/db.server";
import { RaiderIOClient } from "~/lib/raiderIO";
import type { CharacterNS } from "~/lib/raiderIO/characters";
import { upsertRunsForPlayer } from "~/lib/runData.server";
import { SYNC_PLAYER_DELAY_MS } from "~/lib/env.server";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Syncs M+ run data for all active events.
 * Fetches from RaiderIO API and persists to the database.
 */
export async function syncActiveEvents(): Promise<void> {
  const activeEvents = await db.event.findMany({
    where: { status: "ACTIVE" },
    include: {
      players: true,
    },
  });

  if (activeEvents.length === 0) {
    console.log("[Sync] No active events to sync");
    return;
  }

  const client = RaiderIOClient.getInstance();

  for (const event of activeEvents) {
    const startedAt = new Date();
    let playersSynced = 0;
    let runsUpserted = 0;
    let hasErrors = false;
    let errorMessages: string[] = [];

    // Create a RUNNING sync log entry
    const syncLog = await db.syncLog.create({
      data: {
        eventId: event.id,
        status: "RUNNING",
        startedAt,
      },
    });

    console.log(
      `[Sync] Starting sync for event "${event.name}" (${event.players.length} players)`
    );

    for (const player of event.players) {
      if (!player.playerName || !player.playerServer) {
        continue;
      }

      try {
        const profile = await client.character.getCharacterProfile({
          region: "us",
          realm: player.playerServer,
          name: player.playerName,
          fields: {
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

        const count = await upsertRunsForPlayer(
          player.id,
          Array.from(uniqueRuns.values())
        );
        runsUpserted += count;
        playersSynced++;

        console.log(
          `[Sync]   ${player.playerName}-${player.playerServer}: ${count} runs upserted`
        );
      } catch (err) {
        hasErrors = true;
        const msg = `${player.playerName}-${player.playerServer}: ${err instanceof Error ? err.message : String(err)}`;
        errorMessages.push(msg);
        console.error(`[Sync]   Error for ${msg}`);
      }

      // Rate limit delay between player API calls
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
  }
}
