import { redirect } from "react-router";
import { H2 } from "~/components/display/headers";
import { db } from "~/lib/db.server";
import { RaiderIOClient } from "~/lib/raiderIO";
import { Route } from "./+types/route";
import { CharacterData } from "./components/characterData";
import { PlayerData } from "./components/playerData";

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

  const client = await RaiderIOClient.getInstance();

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

  return {
    player,
    playerData,
    scoreTiers,
  };
};
export const action = async ({}: Route.ActionArgs) => {};

export default function PlayerShow({
  loaderData: { player, playerData, scoreTiers },
  params: { slug },
}: Route.ComponentProps) {
  return (
    <article>
      <H2>Player</H2>

      <PlayerData player={player} eventSlug={slug} />

      <CharacterData playerData={playerData} scoreTiers={scoreTiers} />
    </article>
  );
}
