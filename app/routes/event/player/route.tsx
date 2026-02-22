import { Link, redirect } from "react-router";
import { db } from "~/lib/db.server";
import { getMythicDataForTeam } from "~/lib/runData.server";
import { RaiderIOClient } from "~/lib/raiderIO";
import { Route } from "./+types/route";
import { CharacterData } from "./components/characterData";

export const loader = async ({ params: { id, slug } }: Route.LoaderArgs) => {
  const player = await db.player.findFirst({
    where: {
      id,
    },
    include: {
      event: true,
      team: {
        include: {
          players: {
            include: { team: true },
          },
        },
      },
    },
  });

  if (!player) {
    throw redirect(`/event/${slug}`);
  }

  const client = RaiderIOClient.getInstance();

  const playerData = player.playerServer && player.playerName
    ? await client.character.getCharacterProfile({
        region: "us",
        realm: player.playerServer,
        name: player.playerName,
        fields: {
          gear: true,
          mythic_plus_best_runs: true,
        },
      })
    : null;

  const scoreTiers = await client.mythicPlus.scoreTiers();

  const mythicData = await getMythicDataForTeam(player.team, {
    after: player.event?.startDate,
    before: player.event?.endDate,
  });

  return {
    player,
    playerData,
    scoreTiers,
    mythicData,
  };
};
export const action = async ({}: Route.ActionArgs) => {};

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
