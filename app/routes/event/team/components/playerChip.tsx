import { RoleDisplay } from "~/components/display/roleDisplay";
import { SpecDisplay } from "~/components/display/specDisplay";
import { getClassAndSpec } from "~/lib/classes";

type Player = {
  playerName?: string | null;
  assignedRole?: string | null;
  spec?: string | null;
};

type PlayerProps = {
  player: Player;
};

export default function PlayerChip({ player }: PlayerProps) {
  const roleColor =
    {
      DPS: "text-red-500",
      Tank: "text-blue-500",
      Healer: "text-green-500",
    }[player.assignedRole?.toLowerCase() ?? ""] || "text-white";

  return (
    <div className="bg-[#333333] rounded-full px-2 p-2 text-xs flex items-center me-4">
      <span className="mr-1">{player.playerName}</span>
      <span className={roleColor}>
        {/* <RoleDisplay playerRole={player.assignedRole?.toLowerCase() ?? null} /> */}
        <SpecDisplay spec={player.spec ?? null} />
      </span>
    </div>
  );
}
