import { Link, redirect } from "react-router";
import { H2 } from "~/components/display/headers";
import { db } from "~/lib/db.server";
import { Route } from "./+types/route";
import { RaiderIOClient } from "~/lib/raiderIO";
import { PlayerData } from "./components/playerData";
import { MythicInfo } from "./components/mythicInfo";
import { getPlayersPromises, parseMythicDataPerTeam } from "~/lib/mythics";

export const loader = async ({ params: { slug, id } }: Route.LoaderArgs) => {
  const team = await db.team.findFirst({
    where: { id },
    include: { players: { include: { team: true } } },
  });

  if (!team) {
    return redirect(`/event/${slug}`);
  }

  const client = RaiderIOClient.getInstance();

  const playersPromises = getPlayersPromises(team, client);

  return {
    team,
    playersPromises,
    mythicData: null,
  };
};
export const action = async ({}: Route.ActionArgs) => ({});

export const clientLoader = async ({
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const serverRes = await serverLoader();

  const mythicData = await parseMythicDataPerTeam(
    serverRes.team,
    serverRes.playersPromises
  );

  return {
    ...serverRes,
    mythicData,
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
