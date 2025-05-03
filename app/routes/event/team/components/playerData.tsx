import { Suspense } from "react";
import { Route } from "../+types/route";
import { Await } from "react-router";
import { Button } from "~/components/ui/button";
import { CharacterName } from "~/components/display/characterName";
import { H3 } from "~/components/display/headers";
import { IlvlDisplay } from "~/components/display/ilvlDisplay";
import { ClassDisplay } from "~/components/display/classDisplay";
import { makeRaiderIOClassSpec } from "~/lib/classes";
import { RoleDisplay } from "~/components/display/roleDisplay";
import { ScoreDisplay } from "~/components/display/scoreDisplay";

type PlayerData = NonNullable<
  Awaited<Route.ComponentProps["loaderData"]["playersPromises"][number]>
>;
type PlayerDataPromise = Promise<PlayerData | null>;

function PlayerDataInternal(player: PlayerData) {
  const playerScore = player.mythic_plus_best_runs.reduce(
    (acc, run) => acc + run.score,
    0
  );

  return (
    <div className="grid grid-cols-[8rem_1fr_8rem] gap-4">
      <img
        src={player.thumbnail_url}
        className="col-span-1 row-span-3 w-32 aspect-square"
      />
      <CharacterName
        as={H3}
        name={player.name}
        server={player.realm}
        region={player.region}
        className="col-span-1 col-start-2"
      />
      <div className="col-start-2 col-span-1 flex flex-row space-x-2">
        <IlvlDisplay
          className="text-xl"
          ilvl={player.gear.item_level_equipped}
        />
        <span className="mx-2">{player.race}</span>
        <ClassDisplay
          classSpec={makeRaiderIOClassSpec(
            player.class,
            player.active_spec_name
          )}
        />
        <RoleDisplay playerRole={player.active_spec_role.toLowerCase()} />
      </div>
      <ScoreDisplay
        as="div"
        className="col-start-3 col-span-1 row-start-1 row-span-2 text-4xl grid place-items-center font-bold"
        score={playerScore}
      />
      <Button asChild className="col-start-2 col-span-2">
        <a href={player.profile_url} target="_blank">
          View RaiderIO Profile
        </a>
      </Button>
    </div>
  );
}

function MissingPlayerData() {
  return (
    <div className="flex flex-col gap-4">
      <p>No character data available.</p>
    </div>
  );
}

export function PlayerData({ player }: { player: PlayerDataPromise }) {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <Await resolve={player} errorElement={<MissingPlayerData />}>
        {(player) =>
          player ? <PlayerDataInternal {...player} /> : <MissingPlayerData />
        }
      </Await>
    </Suspense>
  );
}
