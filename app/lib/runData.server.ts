import type { CharacterNS } from "~/lib/raiderIO/characters";
import type { DBPlayerType, DBTeamType, MythicData } from "~/lib/mythics";
import {
  getPlayersPromises,
  parseMythicDataPerTeam,
} from "~/lib/mythics";
import { RaiderIOClient } from "~/lib/raiderIO";
import { db } from "~/lib/db.server";

/**
 * Upserts MythicPlusRun rows and creates PlayerRun links for a given player.
 * When dateRange is provided, only runs within the range are upserted.
 */
export async function upsertRunsForPlayer(
  playerId: string,
  runs: CharacterNS.MythicPlusRun[],
  dateRange?: { after?: Date | null; before?: Date | null }
): Promise<number> {
  let upserted = 0;

  for (const run of runs) {
    // Skip runs outside the event date range
    if (dateRange) {
      const completedAt = new Date(run.completed_at);
      if (dateRange.after && completedAt < dateRange.after) continue;
      if (dateRange.before && completedAt > dateRange.before) continue;
    }

    const dbRun = await db.mythicPlusRun.upsert({
      where: { keystoneRunId: run.keystone_run_id },
      create: {
        keystoneRunId: run.keystone_run_id,
        dungeon: run.dungeon,
        shortName: run.short_name,
        mythicLevel: run.mythic_level,
        completedAt: new Date(run.completed_at),
        clearTimeMs: run.clear_time_ms,
        parTimeMs: run.par_time_ms,
        numKeystoneUpgrades: run.num_keystone_upgrades,
        mapChallengeModeId: run.map_challenge_mode_id,
        zoneId: run.zone_id,
        zoneExpansionId: run.zone_expansion_id,
        iconUrl: run.icon_url,
        backgroundImageUrl: run.background_image_url,
        score: run.score,
        url: run.url,
        affixes: JSON.stringify(run.affixes),
      },
      update: {
        dungeon: run.dungeon,
        shortName: run.short_name,
        mythicLevel: run.mythic_level,
        completedAt: new Date(run.completed_at),
        clearTimeMs: run.clear_time_ms,
        parTimeMs: run.par_time_ms,
        numKeystoneUpgrades: run.num_keystone_upgrades,
        mapChallengeModeId: run.map_challenge_mode_id,
        zoneId: run.zone_id,
        zoneExpansionId: run.zone_expansion_id,
        iconUrl: run.icon_url,
        backgroundImageUrl: run.background_image_url,
        score: run.score,
        url: run.url,
        affixes: JSON.stringify(run.affixes),
      },
    });

    // Create PlayerRun link (ignore if already exists)
    await db.playerRun.upsert({
      where: {
        playerId_runId: { playerId, runId: dbRun.id },
      },
      create: { playerId, runId: dbRun.id },
      update: {},
    });

    upserted++;
  }

  return upserted;
}

/**
 * Upserts a cached player profile from RaiderIO API data.
 */
export async function upsertPlayerProfile(
  playerId: string,
  profile: CharacterNS.CharacterPayloadBase & {
    gear: { item_level_equipped: number; items: Record<string, unknown> };
    mythic_plus_best_runs: CharacterNS.MythicPlusRun[];
  }
): Promise<void> {
  const data = {
    name: profile.name,
    race: profile.race,
    class: profile.class,
    activeSpecName: profile.active_spec_name,
    activeSpecRole: profile.active_spec_role,
    faction: profile.faction,
    region: profile.region,
    realm: profile.realm,
    thumbnailUrl: profile.thumbnail_url,
    profileUrl: profile.profile_url,
    itemLevelEquipped: profile.gear.item_level_equipped,
    gearItems: JSON.stringify(profile.gear.items),
    bestRuns: JSON.stringify(profile.mythic_plus_best_runs),
  };

  await db.cachedPlayerProfile.upsert({
    where: { playerId },
    create: { playerId, ...data },
    update: data,
  });
}

/**
 * Gets a cached player profile from the database.
 * Returns data in the same shape as a CharacterProfilePayload with gear + best runs.
 */
export async function getCachedPlayerProfile(playerId: string) {
  const cached = await db.cachedPlayerProfile.findUnique({
    where: { playerId },
  });

  if (!cached) return null;

  return {
    name: cached.name,
    race: cached.race,
    class: cached.class,
    active_spec_name: cached.activeSpecName,
    active_spec_role: cached.activeSpecRole,
    gender: "",
    faction: cached.faction,
    achievement_points: 0,
    thumbnail_url: cached.thumbnailUrl,
    region: cached.region,
    realm: cached.realm,
    last_crawled_at: cached.updatedAt.toISOString(),
    profile_url: cached.profileUrl,
    profile_banner: "",
    gear: {
      item_level_equipped: cached.itemLevelEquipped,
      items: JSON.parse(cached.gearItems),
    },
    mythic_plus_best_runs: JSON.parse(cached.bestRuns) as CharacterNS.MythicPlusRun[],
  };
}

/**
 * Queries cached runs for all players on a team.
 * Groups by keystoneRunId, builds participant lists,
 * filters to runs with >= 3 team members, and sorts by level/score/name.
 * Returns MythicData[] (same shape as parseMythicDataPerTeam).
 */
export async function getCachedRunsForTeam(
  team: DBTeamType,
  options?: { after?: Date | null; before?: Date | null }
): Promise<MythicData[]> {
  const playerIds = team.players.map((p) => p.id);

  // Build date filter for completedAt
  const dateFilter: Record<string, Date> = {};
  if (options?.after) dateFilter.gte = options.after;
  if (options?.before) dateFilter.lte = options.before;

  // Query all PlayerRun rows for this team's players, joined with the run data
  const playerRuns = await db.playerRun.findMany({
    where: {
      playerId: { in: playerIds },
      run: Object.keys(dateFilter).length > 0
        ? { completedAt: dateFilter }
        : undefined,
    },
    include: {
      run: true,
      player: {
        include: { team: true },
      },
    },
  });

  // Group by keystoneRunId
  const runMap = new Map<
    number,
    { run: (typeof playerRuns)[number]["run"]; participants: DBPlayerType[] }
  >();

  for (const pr of playerRuns) {
    const keystoneRunId = pr.run.keystoneRunId;
    const existing = runMap.get(keystoneRunId);

    if (!existing) {
      runMap.set(keystoneRunId, {
        run: pr.run,
        participants: [pr.player],
      });
    } else {
      // Avoid duplicate participants
      if (!existing.participants.some((p) => p.id === pr.player.id)) {
        existing.participants.push(pr.player);
      }
    }
  }

  // Filter to runs with >= 3 team members and build MythicData[]
  const mythics: MythicData[] = [];

  for (const [, { run, participants }] of runMap) {
    if (participants.length < 3) continue;

    mythics.push({
      dungeon: run.dungeon,
      short_name: run.shortName,
      mythic_level: run.mythicLevel,
      completed_at: run.completedAt.toISOString(),
      clear_time_ms: run.clearTimeMs,
      keystone_run_id: run.keystoneRunId,
      par_time_ms: run.parTimeMs,
      num_keystone_upgrades: run.numKeystoneUpgrades,
      map_challenge_mode_id: run.mapChallengeModeId,
      zone_id: run.zoneId,
      zone_expansion_id: run.zoneExpansionId,
      icon_url: run.iconUrl,
      background_image_url: run.backgroundImageUrl,
      score: run.score,
      url: run.url,
      affixes: JSON.parse(run.affixes),
      participants,
    });
  }

  // Sort: mythic_level desc, score desc, short_name asc
  mythics.sort(
    (a, b) =>
      b.mythic_level - a.mythic_level ||
      b.score - a.score ||
      a.short_name.localeCompare(b.short_name)
  );

  return mythics;
}

/**
 * Gets mythic data for a team, trying the DB cache first then falling
 * back to the live RaiderIO API if the cache is empty.
 */
export async function getMythicDataForTeam(
  team: DBTeamType | null,
  options?: { after?: Date | null; before?: Date | null }
): Promise<MythicData[] | null> {
  if (!team) return null;

  // Try DB cache first
  const cached = await getCachedRunsForTeam(team, options);
  if (cached.length > 0) {
    return cached;
  }

  // Fallback to live API
  console.log(
    `[getMythicDataForTeam] Cache empty for team "${team.name}", fetching from RaiderIO API`
  );
  const client = RaiderIOClient.getInstance();
  const playersPromises = getPlayersPromises(team, client);
  const mythicData = await parseMythicDataPerTeam(team, playersPromises);
  return mythicData;
}
