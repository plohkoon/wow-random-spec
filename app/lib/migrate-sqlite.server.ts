import { db } from "~/lib/db.server";
import { existsSync } from "fs";
import { resolve } from "path";

/**
 * One-time migration: copies all data from SQLite to Postgres.
 * Runs at boot if SQLITE_DATABASE_URL is set, the file exists,
 * and the Postgres Event table is empty.
 */
export async function migrateFromSqlite(): Promise<void> {
  const sqliteUrl = process.env.SQLITE_DATABASE_URL;
  if (!sqliteUrl) return;

  // Resolve the SQLite file path from the URL (strip "file:" prefix)
  const sqlitePath = resolve(
    process.cwd(),
    sqliteUrl.replace(/^file:\.?\/?\/?/, "")
  );
  if (!existsSync(sqlitePath)) {
    console.log(
      `[migrate-sqlite] SQLite file not found at ${sqlitePath}, skipping migration`
    );
    return;
  }

  // Check if Postgres already has data
  const eventCount = await db.event.count();
  if (eventCount > 0) {
    console.log(
      "[migrate-sqlite] Postgres already has data, skipping migration"
    );
    return;
  }

  console.log("[migrate-sqlite] Starting SQLite → Postgres migration...");

  // Dynamically import the SQLite client (untyped — schemas differ on Json vs String fields)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { PrismaClient: PrismaClientSqlite } = await import(
    "../../generated/prisma-sqlite/client.js"
  ) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sqliteDb = new PrismaClientSqlite() as any;

  try {
    // 1. Users
    const users = await sqliteDb.user.findMany();
    if (users.length > 0) {
      await db.user.createMany({ data: users });
      console.log(`[migrate-sqlite] Migrated ${users.length} users`);
    }

    // 2. Events
    const events = await sqliteDb.event.findMany();
    if (events.length > 0) {
      await db.event.createMany({ data: events });
      console.log(`[migrate-sqlite] Migrated ${events.length} events`);
    }

    // 3. Teams (depends on Event)
    const teams = await sqliteDb.team.findMany();
    if (teams.length > 0) {
      await db.team.createMany({ data: teams });
      console.log(`[migrate-sqlite] Migrated ${teams.length} teams`);
    }

    // 4. Players (depends on Event, Team)
    const players = await sqliteDb.player.findMany();
    if (players.length > 0) {
      await db.player.createMany({ data: players });
      console.log(`[migrate-sqlite] Migrated ${players.length} players`);
    }

    // 5. MythicPlusRuns — JSON.parse(affixes) for JSONB
    const runs = await sqliteDb.mythicPlusRun.findMany();
    if (runs.length > 0) {
      await db.mythicPlusRun.createMany({
        data: runs.map((run: Record<string, unknown>) => ({
          ...run,
          affixes: JSON.parse(run.affixes as string),
        })),
      });
      console.log(`[migrate-sqlite] Migrated ${runs.length} mythic plus runs`);
    }

    // 6. PlayerRuns (depends on Player, MythicPlusRun)
    const playerRuns = await sqliteDb.playerRun.findMany();
    if (playerRuns.length > 0) {
      await db.playerRun.createMany({ data: playerRuns });
      console.log(
        `[migrate-sqlite] Migrated ${playerRuns.length} player runs`
      );
    }

    // 7. SyncLogs (depends on Event)
    const syncLogs = await sqliteDb.syncLog.findMany();
    if (syncLogs.length > 0) {
      await db.syncLog.createMany({ data: syncLogs });
      console.log(`[migrate-sqlite] Migrated ${syncLogs.length} sync logs`);
    }

    // 8. CachedPlayerProfiles (depends on Player) — JSON.parse gearItems + bestRuns
    const profiles = await sqliteDb.cachedPlayerProfile.findMany();
    if (profiles.length > 0) {
      await db.cachedPlayerProfile.createMany({
        data: profiles.map((p: Record<string, unknown>) => ({
          ...p,
          gearItems: JSON.parse(p.gearItems as string),
          bestRuns: JSON.parse(p.bestRuns as string),
        })),
      });
      console.log(
        `[migrate-sqlite] Migrated ${profiles.length} cached player profiles`
      );
    }

    console.log("[migrate-sqlite] Migration complete!");
  } finally {
    await sqliteDb.$disconnect();
  }
}
