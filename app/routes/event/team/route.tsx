import { Link, redirect } from "react-router";
import { H2 } from "~/components/display/headers";
import { db } from "~/lib/db.server";
import { Route } from "./+types/route";
import { RaiderIOClient } from "~/lib/raiderIO";
import { PlayerData } from "./components/playerData";
import { MythicInfo } from "./components/mythicInfo";
import {getPlayersPromises, parseMythicDataPerTeam} from "~/lib/mythics"

export const loader = async ({ params: { slug, id } }: Route.LoaderArgs) => {
  const team = await db.team.findFirst({
    where: { id },
    include: { players: { include: { team: true } } },
  });

  if (!team) {
    return redirect(`/event/${slug}`);
  }

  const client = RaiderIOClient.getInstance();

  const playersPromises =  getPlayersPromises(team, client);

  return {
    team,
    playersPromises,
    mythicData: null
  };
};
export const action = async ({}: Route.ActionArgs) => ({});

export const clientLoader = async ({
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const serverRes = await serverLoader();

  const mythicData = await parseMythicDataPerTeam(serverRes.team, serverRes.playersPromises);

//   console.log(serverRes);
//
//   const parsedMythicData =  await ParseMythicDataPerTeam(serverRes.team.players, serverRes.playersPromises);
//
//   return {
//     ...serverRes,
//     ...parsedMythicData,
//   }
  // const players = serverRes.team.players;
  // const playersMap = new Map<string, (typeof players)[number]>();
  // players.forEach((p) => playersMap.set(p.id, p));
  //
  // // Set these promises up in the client loader so they are stable in the react application.
  // const allPlayersPromise = Promise.allSettled(serverRes.playersPromises);
  // const mythicsPromise = allPlayersPromise.then((res) => { // console.log("Mythics Promise", res);
  //   if (!res) return res;
  //
  //   const succeededRes = res
  //       .filter((r: any) => r.status === "fulfilled")
  //       .map((r: any) => r.value);
  //
  //   type MythicType = NonNullable<
  //       (typeof succeededRes)[number]
  //   >["mythic_plus_best_runs"][number];
  //
  //   const mythicMap = new Map<number, MythicType>();
  //   const participantMap = new Map<number, string[]>();
  //   // console.log("DB Players", players);
  //
  //   succeededRes.forEach((player: any) => {
  //     if (!player) return;
  //     // We just want to resolve via the dbPlayer ID so we find and ensure we have that.
  //     const dbPlayer = players.find(({ playerName, playerServer }) => {
  //       // Strip whitespace and replace lowercase to slugify everything for more accurate
  //       // matching. This should be fine since names are not case-sensitive.
  //       const strip = (str: string | undefined | null) =>
  //           str?.toLocaleLowerCase()?.replace(/\s/, "");
  //
  //       return (
  //           strip(playerName) === strip(player.name) &&
  //           strip(playerServer) === strip(player.realm)
  //       );
  //     });
  //     // console.log("DB Player", dbPlayer, player.name, player.realm);
  //     if (!dbPlayer) return;
  //
  //     const allMythics = [
  //       ...(player.mythic_plus_best_runs ?? []),
  //       ...(player.mythic_plus_alternate_runs ?? []),
  //       ...(player.mythic_plus_highest_level_runs ?? []),
  //       ...(player.mythic_plus_recent_runs ?? []),
  //       ...(player.mythic_plus_previous_weekly_highest_level_runs ?? []),
  //       ...(player.mythic_plus_weekly_highest_level_runs ?? []),
  //     ];
  //
  //     allMythics.forEach((run) => {
  //       mythicMap.set(run.keystone_run_id, run);
  //
  //       const participantsList = participantMap.get(run.keystone_run_id);
  //
  //       // Ensure this player is in the participant list
  //       if (!participantsList) {
  //         participantMap.set(run.keystone_run_id, [dbPlayer.id]);
  //       } else if (participantsList.findIndex((id) => id === dbPlayer.id) < 0) {
  //         participantsList.push(dbPlayer.id);
  //       }
  //     });
  //   });
  //
  //   // console.log("Mythic Map", mythicMap);
  //   // console.log("Participant Map", participantMap);
  //
  //   // A mythic counts if at least 4 players of the team are in it.
  //   const mythics = Array.from(mythicMap.values())
  //       .flatMap((m) => {
  //         const participants = participantMap.get(m.keystone_run_id);
  //
  //         // If there were no participants or not enough participants this does not count as a key for this team.
  //         // if (!participants || participants.length < 4) {
  //         //   return [];
  //         // }
  //
  //         return [
  //           {
  //             ...m,
  //             participants: participants
  //                 .map((p) => playersMap.get(p))
  //                 .filter((p) => p !== undefined),
  //           },
  //         ];
  //       })
  //       .sort(
  //           (mythicA, mythicB) =>
  //               // First sort descending on the keystone level so higher keystones are at the top.
  //               mythicB.mythic_level - mythicA.mythic_level ||
  //               // Next descending by score.
  //               mythicB.score - mythicA.score ||
  //               // Finally sort ascending within the score and mythic level category by string.
  //               mythicA.short_name.localeCompare(mythicB.short_name)
  //       );
  //
  //   return mythics;
  // });
  //
  return {
    ...serverRes,
    mythicData
  };
};
clientLoader.hydrate = true;

export default function TeamShow({
  loaderData: { team, playersPromises, mythicData },
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
      <MythicInfo mythics={mythicData} />
    </article>
  );
}
