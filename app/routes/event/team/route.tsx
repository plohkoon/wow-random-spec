import { Await, Link, redirect } from "react-router";
import { H2 } from "~/components/display/headers";
import { db } from "~/lib/db.server";
import { Route } from "./+types/route";
import { RaiderIOClient } from "~/lib/raiderIO";
import { Suspense } from "react";
import { PlayerData } from "./components/playerData";
import { MythicInfo } from "./components/mythicInfo";

export const loader = async ({ params: { slug, id } }: Route.LoaderArgs) => {
  const team = await db.team.findFirst({
    where: { id },
    include: { players: { include: { team: true } } },
  });

  if (!team) {
    return redirect(`/event/${slug}`);
  }

  const client = await RaiderIOClient.getInstance();

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

  return {
    team,
    playersPromises,
    allPlayersPromise: null,
    mythicsPromise: null,
  };
};
export const action = async ({}: Route.ActionArgs) => ({});

export const clientLoader = async ({
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const serverRes = await serverLoader();

  const players = serverRes.team.players;
  const playersMap = new Map<string, (typeof players)[number]>();
  players.forEach((p) => playersMap.set(p.id, p));

  // Set these promises up in the client loader so they are stable in the react application.
  const allPlayersPromise = Promise.allSettled(serverRes.playersPromises);
  const mythicsPromise = allPlayersPromise.then((res) => {
    console.log("Mythics Promise", res);
    if (!res) return res;

    const succeededRes = res
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    type MythicType = NonNullable<
      (typeof succeededRes)[number]
    >["mythic_plus_best_runs"][number];

    const mythicMap = new Map<number, MythicType>();
    const participantMap = new Map<number, string[]>();

    succeededRes.forEach((player) => {
      if (!player) return;
      // We just want to resolve via the dbPlayer ID so we find and ensure we have that.
      const dbPlayer = players.find(
        ({ playerName, playerServer }) =>
          playerName === player.name && playerServer === player.realm
      );
      console.log("DB Player", dbPlayer, player.name, player.realm);
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
        } else if (participantsList.findIndex((id) => id === dbPlayer.id) < 0) {
          participantsList.push(dbPlayer.id);
        }
      });
    });

    console.log("Mythic Map", mythicMap);
    console.log("Participant Map", participantMap);

    // A mythic counts if at least 4 players of the team are in it.
    const mythics = Array.from(mythicMap.values())
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
          // First sort descending on the keystone level so higher keystones are at the top
          mythicB.mythic_level - mythicA.mythic_level ||
          // Next descending by score..
          mythicB.score - mythicA.score ||
          // Finally sort ascending within the score and mythic level category by string.
          mythicA.short_name.localeCompare(mythicB.short_name)
      );

    return mythics;
  });

  return {
    ...serverRes,
    allPlayersPromise,
    mythicsPromise,
  };
};
clientLoader.hydrate = true;

export default function TeamShow({
  loaderData: { team, playersPromises, allPlayersPromise, mythicsPromise },
  params: { slug },
}: Route.ComponentProps) {
  return (
    <article>
      <Link to={`/event/${slug}/`} className="underline">
        {"<"} Back to event.
      </Link>
      <H2>{team.name}</H2>
      {playersPromises.map((playerPromise, index) => (
        <PlayerData player={playerPromise} key={index} />
      ))}
      <MythicInfo mythics={mythicsPromise} />
    </article>
  );
}
