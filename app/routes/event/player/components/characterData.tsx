import { User } from "lucide-react";
import { Suspense } from "react";
import { Await } from "react-router";
import { CharacterName } from "~/components/display/characterName";
import { ClassDisplay } from "~/components/display/classDisplay";
import { H3, H4 } from "~/components/display/headers";
import { IlvlDisplay } from "~/components/display/ilvlDisplay";
import { RoleDisplay } from "~/components/display/roleDisplay";
import { ScoreDisplay } from "~/components/display/scoreDisplay";
import { Button } from "~/components/ui/button";
import { makeRaiderIOClassSpec } from "~/lib/classes";
import { msToDuration } from "~/lib/time";
import type { Route } from "../+types/route";
import CharacterProfile from "./characterProfile";
import EquipmentData from "./equipmentData";
import PlayerMythicData from "./mythicData";
import { MythicData } from "~/lib/mythics";
import TeamData from "./teamData";
// import MythicData from "./mythicData";

type Player = Route.ComponentProps["loaderData"]["player"];

type PlayerData = NonNullable<
  Awaited<Route.ComponentProps["loaderData"]["playerData"]>
>;
type ScoreTiers = NonNullable<
  Awaited<Route.ComponentProps["loaderData"]["scoreTiers"]>
>;
type PlayerDataPromise = Promise<PlayerData | null>;
type ScoreTiersPromise = Promise<ScoreTiers | null>;

function CharacterDataInternal(
  props: PlayerData & {
    scoreTiers: ScoreTiers;
    player: Player;
    mythicData: MythicData[] | null;
  },
) {
  const { player, mythicData } = props;
  
  const objectKeys = Object.keys(
    props.gear.items
  ) as (keyof PlayerData["gear"]["items"])[];

  const playerScore = props.mythic_plus_best_runs.reduce(
    (acc, run) => acc + run.score,
    0
  );

  
  return (
    <div className="flex flex-col gap-4 px-4 mt-4">
      <CharacterProfile character={props} score={playerScore} />
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PlayerMythicData props={props} msToDuration={msToDuration} />
          </div>
          <div className="lg:col-span-1">
            <TeamData player={player} mythicData={mythicData}/>
          </div>
        </div>
            <EquipmentData objectKeys={objectKeys} gear={props.gear} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto">
          {/* {objectKeys.map((key) => {
            const item = props.gear.items[key];
            if (!item) return null;
            return (
              <div
                className="even:flex-row-reverse odd:flex-row flex group even:text-right"
                key={item.item_id}
              >
                
                {/* This works but we don't wanna get in trouble lmao */}
          {/* <img src={`https://cdn.raiderio.net/images/wow/icons/large/${item.icon}.jpg`} /> */}

          {/* <User width={64} height={64} />
                <div>
                  <H4>{item.name}</H4>
                  <p>
                    {key} <IlvlDisplay ilvl={item.item_level} />
                  </p>
                </div>
              </div>
            );
          })}  */}
          {/* <div className="flex flex-col space-y-1">
          {props.mythic_plus_best_runs.map((run) => {
            return (
              <div
                className="flex flex-row space-x-2"
                key={run.keystone_run_id}
              >
                <img src={run.icon_url} className="w-20 aspect-square" />
                <div className="flex flex-col">
                  <H4>
                    {run.dungeon} ({run.short_name} +{run.mythic_level})
                  </H4>
                  <p>
                    Time: {msToDuration(run.clear_time_ms)} /{" "}
                    {msToDuration(run.par_time_ms)} (
                    {(
                      ((run.clear_time_ms - run.par_time_ms) /
                        run.par_time_ms) *
                      100
                    ).toFixed(3)}
                    %)
                  </p>
                  <p>
                    Score: <ScoreDisplay individual score={run.score} />
                  </p>
                </div>
              </div>
            );
          })}
        </div> */}
        </div>
      </div>
    </div>
  );
}

function MissingCharacterData() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Character Data</h2>
      <p>No character data available.</p>
    </div>
  );
}

export function CharacterData({
  playerData,
  scoreTiers,
  player,
  eventSlug,
  mythicData
}: {
  playerData: PlayerDataPromise;
  scoreTiers: ScoreTiersPromise;
  player: Player;
  eventSlug: string;
  mythicData: MythicData[] | null;
}) {
  return (
    <Suspense fallback={<div>Loading..</div>}>
      <Await
        resolve={Promise.all([playerData, scoreTiers])}
        errorElement={<MissingCharacterData />}
      >
        {([data, tiers]) =>
          data ? (
            <CharacterDataInternal {...data} scoreTiers={tiers ?? []} player={player} mythicData={mythicData}/>
          ) : (
            <MissingCharacterData />
          )
        }
      </Await>
    </Suspense>
  );
}

//old code for ref

{
  /* <div className="grid grid-cols-[8rem_1fr_8rem] gap-4">
        <img
          src={props.thumbnail_url}
          className="col-span-1 row-span-3 w-32 aspect-square"
        />
        <p>{props.active_spec_role}</p>
        <CharacterName
          as={H3}
          name={props.name}
          server={props.realm}
          region={props.region}
          className="col-span-1 col-start-2"
        />
        <div className="col-start-2 col-span-1 flex flex-row space-x-2">
          <IlvlDisplay
            className="text-xl"
            ilvl={props.gear.item_level_equipped}
          />
          <span className="mx-2">{props.race}</span>
          <ClassDisplay
            classSpec={makeRaiderIOClassSpec(
              props.class,
              props.active_spec_name
            )}
          />
          <RoleDisplay playerRole={props.active_spec_role.toLowerCase()} />
        </div>
        <ScoreDisplay
          as="div"
          className="col-start-3 col-span-1 row-start-1 row-span-2 text-4xl grid place-items-center font-bold"
          score={playerScore}
        />
        <Button asChild className="col-start-2 col-span-2">
          <a href={props.profile_url} target="_blank">
            View RaiderIO Profile
          </a>
        </Button>
      </div> */
}
