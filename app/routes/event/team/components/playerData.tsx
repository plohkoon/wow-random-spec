import { Suspense } from "react";
import { Route } from "../+types/route";
import { Await, Link } from "react-router";
import { Button } from "~/components/ui/button";
import { CharacterName } from "~/components/display/characterName";
import { H3 } from "~/components/display/headers";
import { IlvlDisplay } from "~/components/display/ilvlDisplay";
import { ClassDisplay } from "~/components/display/classDisplay";
import { makeRaiderIOClassSpec } from "~/lib/classes";
import { RoleDisplay } from "~/components/display/roleDisplay";
import { ScoreDisplay } from "~/components/display/scoreDisplay";
import { Card } from "~/components/ui/card";

type PlayerData = NonNullable<
  Awaited<Route.ComponentProps["loaderData"]["playersPromises"][number]>
>;
type PlayerDataPromise = Promise<PlayerData | null>;

function PlayerDataInternal(player: PlayerData) {
  const playerScore =
    player.mythic_plus_best_runs?.reduce((acc, run) => acc + run.score, 0) || 0;
  console.log(player);
  return (
<div>
  <Card className="bg-[#222222] border-[#333333] overflow-hidden">
    <div className="flex items-center p-3">
      <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-[#444444] mr-4 flex-shrink-0">
        <img
          src={player.thumbnail_url || "/placeholder.svg"}
          alt={player.name}
          width={128}
          height={128}
          className="object-cover"
        />
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between flex-1">
        <div>
          <CharacterName
            as={H3}
            name={player.name}
            server={player.realm}
            region={player.region}
          />
          <p className="text-xs mt-1 flex flex-wrap gap-2 text-gray-300">
            <span>{player.race}</span>
            <ClassDisplay
              classSpec={makeRaiderIOClassSpec(
                player.class,
                player.active_spec_name
              )}
            />
            <RoleDisplay playerRole={player.active_spec_role.toLowerCase()} />
          </p>
        </div>
        <div className="mt-2 md:mt-0 text-green-500 text-lg font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
          <ScoreDisplay score={playerScore} />
        </div>
      </div>
    </div>
    <div className="bg-[#2a2a2a] p-1 text-center border-t border-[#333333]">
      <Button
        asChild
        className="text-xs text-gray-300 hover:text-white flex items-center justify-center w-full"
      >
        <a href={player.profile_url} target="_blank" rel="noopener noreferrer">
          View RaiderIO Profile
        </a>
      </Button>
    </div>
  </Card>
</div>
    // <div className="grid grid-cols-[8rem_1fr_8rem] gap-4">
    //   <img
    //     src={player.thumbnail_url}
    //     className="col-span-1 row-span-3 w-32 aspect-square"
    //   />
    //   <CharacterName
    //     as={H3}
    //     name={player.name}
    //     server={player.realm}
    //     region={player.region}
    //     className="col-span-1 col-start-2"
    //   />
    //   <div className="col-start-2 col-span-1 flex flex-row space-x-2">
    //     <IlvlDisplay
    //       className="text-xl"
    //       ilvl={player.gear.item_level_equipped}
    //     />
    //     <span className="mx-2">{player.race}</span>
    //     <ClassDisplay
    //       classSpec={makeRaiderIOClassSpec(
    //         player.class,
    //         player.active_spec_name
    //       )}
    //     />
    //     <RoleDisplay playerRole={player.active_spec_role.toLowerCase()} />
    //   </div>
    //   <ScoreDisplay
    //     as="div"
    //     className="col-start-3 col-span-1 row-start-1 row-span-2 text-4xl grid place-items-center font-bold"
    //     score={playerScore}
    //   />
    //   <Button asChild className="col-start-2 col-span-2">
    //     <a href={player.profile_url} target="_blank">
    //       View RaiderIO Profile
    //     </a>
    //   </Button>
    // </div>
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
