import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "~/components/ui/table";
import type { Route } from "../+types/route";
import { ClassDisplay } from "~/components/display/classDisplay";
import { RoleDisplay } from "~/components/display/roleDisplay";
import { CharacterName } from "~/components/display/characterName";
import { TeamDataTable } from "../../show/components/teamDataTable";

type Player = Route.ComponentProps["loaderData"]["player"];

export function PlayerData({
  player,
  eventSlug,
}: {
  player: Player;
  eventSlug: string;
}) {
  return (
    <section className="grid grid-cols-[2fr_3fr] gap-4">
      <Table>
        <TableBody>
          <TableRow>
            <TableHead>Nickname</TableHead>
            <TableCell>{player.nickname}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Assigned Role</TableHead>
            <RoleDisplay as={TableCell} playerRole={player.assignedRole} />
          </TableRow>
          <TableRow>
            <TableHead>Main</TableHead>
            <ClassDisplay as={TableCell} classSpec={player.main} />
          </TableRow>
          <TableRow>
            <TableHead>Rolled Spec</TableHead>
            <ClassDisplay as={TableCell} classSpec={player.spec} />
          </TableRow>
          <TableRow>
            <TableHead>Character Name</TableHead>
            <CharacterName
              as={TableCell}
              name={player.playerName}
              server={player.playerServer}
            />
          </TableRow>
        </TableBody>
      </Table>
      {player.team ? (
        <TeamDataTable team={player.team} />
      ) : (
        <div>No Team Assigned Yet</div>
      )}
    </section>
  );
}
