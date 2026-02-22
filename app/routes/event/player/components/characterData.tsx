import { MythicData } from "~/lib/mythics";
import type { Route } from "../+types/route";
import CharacterProfile from "./characterProfile";
import EquipmentData from "./equipmentData";
import PlayerMythicData from "./mythicData";
import TeamData from "./teamData";

type Player = Route.ComponentProps["loaderData"]["player"];
type PlayerData = NonNullable<Route.ComponentProps["loaderData"]["playerData"]>;

function CharacterDataInternal(
  props: PlayerData & {
    player: Player;
    mythicData: MythicData[] | null;
  }
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
            <PlayerMythicData props={props} />
          </div>
          <div className="lg:col-span-1">
            <TeamData player={player} mythicData={mythicData} />
          </div>
        </div>
        <EquipmentData objectKeys={objectKeys} gear={props.gear} />
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
  player,
  eventSlug,
  mythicData,
}: {
  playerData: PlayerData | null;
  player: Player;
  eventSlug: string;
  mythicData: MythicData[] | null;
}) {
  if (!playerData) return <MissingCharacterData />;

  return (
    <CharacterDataInternal
      {...playerData}
      player={player}
      mythicData={mythicData}
    />
  );
}
