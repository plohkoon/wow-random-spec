import { Link, redirect } from "react-router";
import { H2 } from "~/components/display/headers";
import { db } from "~/lib/db.server";
import { RaiderIOClient } from "~/lib/raiderIO";
import { Route } from "./+types/route";
import { CharacterData } from "./components/characterData";
import { PlayerData } from "./components/playerData";
import { getPlayersPromises, parseMythicDataPerTeam } from "~/lib/mythics";

export const loader = async ({ params: { id, slug } }: Route.LoaderArgs) => {
  const player = await db.player.findFirst({
    where: {
      id,
    },
    include: {
      event: true,
      team: {
        include: {
          players: true,
        },
      },
    },
  });

  if (!player) {
    throw redirect(`/event/${slug}`);
  }

  const client = RaiderIOClient.getInstance();

  let playerData =
    player.playerServer && player.playerName
      ? client.character.getCharacterProfile({
          region: "us",
          realm: player.playerServer,
          name: player.playerName,
          fields: {
            gear: true,
            mythic_plus_best_runs: true,
          },
        })
      : Promise.resolve(null);

  const scoreTiers = client.mythicPlus.scoreTiers();

  const playersPromises = getPlayersPromises(player.team, client);

  return {
    player,
    playerData,
    scoreTiers,
    playersPromises,
    mythicData: null,
  };
};
export const action = async ({}: Route.ActionArgs) => {};

export const clientLoader = async ({
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const serverRes = await serverLoader();

  const mythicData = await parseMythicDataPerTeam(
    serverRes.player.team,
    serverRes.playersPromises
  );

  return {
    ...serverRes,
    mythicData,
  };
};
clientLoader.hydrate = true;

export default function PlayerShow({
  loaderData: { player, playerData, scoreTiers, mythicData },
  params: { slug },
}: Route.ComponentProps) {
  return (
    <article>
      <Link to={`/event/${slug}/`} className="underline">
        {"<"} Back to leaderboard
      </Link>

      <div className="">
        <CharacterData
          playerData={playerData}
          scoreTiers={scoreTiers}
          player={player}
          eventSlug={slug}
          mythicData={mythicData}
        />
      </div>
      {/* <PlayerData player={player} eventSlug={slug} mythicData={mythicData} /> */}
    </article>
  );
}
