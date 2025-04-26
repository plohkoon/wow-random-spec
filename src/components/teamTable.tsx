import { PlayerType, usePlayers } from "@/lib/usePlayers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { RoleDisplay } from "./roleDisplay";
import { ClassDisplay } from "./classDisplay";

export function TeamTable() {
  const { players } = usePlayers();

  const teams = players.reduce((acc, player) => {
    if (player.team) {
      if (!acc[player.team]) {
        acc[player.team] = [];
      }
      acc[player.team].push(player);
    } else {
      if (!acc["Unassigned"]) {
        acc["Unassigned"] = [];
      }
      acc["Unassigned"].push(player);
    }

    return acc;
  }, {} as Record<string, PlayerType[]>);

  for (const team in teams) {
    teams[team].sort((a, b) => {
      const aNum =
        {
          tank: 0,
          healer: 1,
          rdps: 2,
          mdps: 3,
          dps: 4,
        }[a.role] ?? 5;
      const bNum =
        {
          tank: 0,
          healer: 1,
          rdps: 2,
          mdps: 3,
          dps: 4,
        }[b.role] ?? 5;
      return aNum - bNum;
    });
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(teams).map(([teamName, teamPlayers]) => (
        <div className="w-full col-span-1" key={teamName}>
          <h2 className="text-xl font-semi-bold">{teamName}</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-lg font-bold">
                  Player
                </TableHead>
                <TableHead className="text-center text-lg font-bold">
                  Role
                </TableHead>
                <TableHead className="text-center text-lg font-bold">
                  Class
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamPlayers.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="text-center">{player.name}</TableCell>
                  <TableCell className="text-center">
                    <RoleDisplay role={player.role} />
                  </TableCell>
                  <TableCell className="text-center p-2">
                    <ClassDisplay
                      as="p"
                      classSpec={player.rolledSpec}
                      fillIn
                      className="w-full rounded-md p-2"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
