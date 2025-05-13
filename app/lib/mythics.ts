import type { CharacterNS } from "~/lib/raiderIO/characters";
import { RaiderIOClient } from "~/lib/raiderIO";

export type DBPlayerInternalTeamType = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  eventId: string;
};

export type DBPlayerType = {
  team?: DBPlayerInternalTeamType | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  nickname: string;
  main?: string | null;
  teamId?: string | null;
  spec?: string | null;
  playerName?: string | null;
  playerServer?: string | null;
  eventId?: string | null;
  assignedRole?: string | null;
};

export type DBTeamType = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  eventId: string;
  players: DBPlayerType[];
};

export type MythicData = CharacterNS.MythicPlusRun & {
  participants: DBPlayerType[];
};

type AllMythicsCharacterProfilePayload = CharacterNS.CharacterProfilePayload<{
  mythic_plus_best_runs: true;
  mythic_plus_alternate_runs: true;
  mythic_plus_highest_level_runs: true;
  mythic_plus_recent_runs: true;
  mythic_plus_previous_weekly_highest_level_runs: true;
  mythic_plus_weekly_highest_level_runs: true;
}>;

export function getPlayersPromises(
  team: DBTeamType | null,
  client: RaiderIOClient
) {
  if (!team) {
    const playersPromises: Promise<null>[] = [Promise.resolve(null)];

    return playersPromises;
  }

  const playersPromises = team.players.map((player) =>
    player.playerServer && player.playerName
      ? client.character.getCharacterProfile({
          region: "us",
          realm: player.playerServer,
          name: player.playerName,
          fields: {
            gear: true,
            mythic_plus_best_runs: true,
            mythic_plus_alternate_runs: true,
            mythic_plus_highest_level_runs: true,
            mythic_plus_recent_runs: true,
            mythic_plus_previous_weekly_highest_level_runs: true,
            mythic_plus_weekly_highest_level_runs: true,
          },
        })
      : Promise.resolve(null)
  );

  return playersPromises;
}

export async function parseMythicDataPerTeam<
  MythicsPromise extends Promise<AllMythicsCharacterProfilePayload | null>
>(team: DBTeamType | null, playersPromises: MythicsPromise[]) {
  if (!team) {
    const promiseOfAllMythicData: Promise<null> = Promise.resolve(null);

    return promiseOfAllMythicData;
  }

  const playersOnTeam = team.players;

  const playersMap = new Map<string, DBPlayerType>();
  playersOnTeam.forEach((p: DBPlayerType) => playersMap.set(p.id, p));

  // Set these promises up in the client loader so they are stable in the react application.
  const allPlayersPromise = Promise.allSettled(playersPromises);
  const promiseOfAllMythicData: Promise<MythicData[]> = allPlayersPromise.then(
    (res) => {
      // console.log("Mythics Promise", res);
      if (!res) return res;

      const succeededRes = res
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      const mythicMap = new Map<number, CharacterNS.MythicPlusRun>();
      const participantMap = new Map<number, string[]>();

      succeededRes.forEach((player) => {
        if (!player) return;
        // We just want to resolve via the dbPlayer ID so we find and ensure we have that.
        const dbPlayer: DBPlayerType | undefined = playersOnTeam.find(
          ({ playerName, playerServer }) => {
            // Strip whitespace and replace lowercase to slugify everything for more accurate
            // matching. This should be fine since names are not case-sensitive.
            const strip = (str: string | undefined | null) =>
              str?.toLocaleLowerCase()?.replace(/\s/, "");

            return (
              strip(playerName) === strip(player.name) &&
              strip(playerServer) === strip(player.realm)
            );
          }
        );
        // console.log("DB Player", dbPlayer, player.name, player.realm);
        if (!dbPlayer) return;

        const allMythics = [
          ...(player.mythic_plus_best_runs ?? []),
          ...(player.mythic_plus_alternate_runs ?? []),
          ...(player.mythic_plus_highest_level_runs ?? []),
          ...(player.mythic_plus_recent_runs ?? []),
          ...(player.mythic_plus_previous_weekly_highest_level_runs ?? []),
          ...(player.mythic_plus_weekly_highest_level_runs ?? []),
        ];

        allMythics.forEach((run) => {
          mythicMap.set(run.keystone_run_id, run);

          const participantsList = participantMap.get(run.keystone_run_id);

          // Ensure this player is in the participant list
          if (!participantsList) {
            participantMap.set(run.keystone_run_id, [dbPlayer.id]);
          } else if (
            participantsList.findIndex((id) => id === dbPlayer.id) < 0
          ) {
            participantsList.push(dbPlayer.id);
          }
        });
      });

      // A mythic counts if at least 4 players of the team are in it.
      const mythics: MythicData[] = Array.from(mythicMap.values())
        .flatMap((m) => {
          const participants = participantMap.get(m.keystone_run_id);

          // If there were no participants or not enough participants this does not count as a key for this team.
          if (!participants || participants.length < 4) {
            return [];
          }

          return [
            {
              ...m,
              participants: participants
                .map((p) => playersMap.get(p))
                .filter((p) => p !== undefined),
            },
          ];
        })
        .sort(
          (mythicA, mythicB) =>
            // First sort descending on the keystone level so higher keystones are at the top.
            mythicB.mythic_level - mythicA.mythic_level ||
            // Next descending by score.
            mythicB.score - mythicA.score ||
            // Finally sort ascending within the score and mythic level category by string.
            mythicA.short_name.localeCompare(mythicB.short_name)
        );

      return mythics;
    }
  );

  return promiseOfAllMythicData;
}

export function calculateBestMythicsAndTotalScore(mythics: MythicData[]) {
  const bestMythicsMap = {} as Record<string, (typeof mythics)[number]>;

  mythics.forEach((m: MythicData) => {
    const existing = bestMythicsMap[m.dungeon];

    // TODO: Maybe incorporate the most recent run into this somehow?
    if (!existing || existing.score < m.score) {
      bestMythicsMap[m.dungeon] = m;
    }
  });

  const bestMythics = Object.values(bestMythicsMap);
  const totalScore = bestMythics.reduce((acc, m) => acc + m.score, 0);

  return [Object.values(bestMythicsMap), totalScore] as const;
}

export function calculateBestScoreAndBestUnderTime(mythics: MythicData[]) {
  const bestSingleScore = mythics.reduce(
    (score: number, m: MythicData) => (score > m.score ? score : m.score),
    0
  );

  const mostUnderTime = mythics.reduce((curr: number, m: MythicData) => {
    const percentUnder = (m.clear_time_ms - m.par_time_ms) / m.par_time_ms;

    if (percentUnder > curr) {
      return percentUnder;
    } else {
      return curr;
    }
  }, 0);
  return [bestSingleScore, mostUnderTime] as const;
}
