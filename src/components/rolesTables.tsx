import {
  availableSpecsForPlayer,
  classSpecs,
  getClassAndSpec,
} from "@/lib/classes";
import { PlayerType, usePlayers } from "@/lib/usePlayers";
import { useMemo } from "react";
import { RoleDisplay } from "./roleDisplay";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import { ClassDisplay } from "./classDisplay";
import { Button } from "./ui/button";
import { usePinwheelState } from "@/lib/pinwheelState";

function partitionPlayers(players: PlayerType[]) {
  return players.reduce(
    (acc, player) => {
      const rolledSpec = player.rolledSpec;
      if (!rolledSpec) {
        acc["rest"].push(player);
        return acc;
      }

      const [playerClass, spec] = getClassAndSpec(rolledSpec);
      const playerRole: string =
        // @ts-expect-error: I'm not even bothering typing this.
        classSpecs[playerClass as keyof typeof classSpecs]?.[
          // @ts-expect-error: I'm not even bothering typing this.
          spec as keyof (typeof classSpecs)[playerClass]
        ];

      if (playerRole in acc) {
        // @ts-expect-error: I'm not even bothering typing this.
        acc[playerRole].push(player);
      } else {
        acc["rest"].push(player);
      }
      return acc;
    },
    {
      tank: [] as PlayerType[],
      healer: [] as PlayerType[],
      dps: [] as PlayerType[],
      rest: [] as PlayerType[],
    }
  );
}

function RoleTable({ players, role }: { players: PlayerType[]; role: string }) {
  return (
    <div className="col-span-1">
      <RoleDisplay role={role} as="h3" className="text-lg font-semibold" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Name</TableHead>
            <TableHead className="text-left">Class</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            return (
              <TableRow key={player.id}>
                <td className="font-semibold">{player.name}</td>
                <ClassDisplay as="td" classSpec={player.rolledSpec ?? "n/a"} />
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function RolesTables() {
  const { players, updatePlayer } = usePlayers();
  const { roll } = usePinwheelState();

  const { tank, healer, dps, rest } = useMemo(
    () => partitionPlayers(players),
    [players]
  );

  const className =
    rest.length > 0 ? "grid grid-cols-4 gap-4" : "grid grid-cols-3 gap-4";

  return (
    <>
      <div className={className}>
        <RoleTable players={tank} role="tank" />
        <RoleTable players={healer} role="healer" />
        <RoleTable players={dps} role="dps" />
        {rest.length > 0 && <RoleTable players={rest} role="Rest" />}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {rest.length > 0 && (
          <Button
            className="col-span-3"
            onClick={() => {
              const index = Math.floor(Math.random() * rest.length);

              const player = rest[index];

              const availableSpecs = availableSpecsForPlayer(player);

              roll(player, availableSpecs, (value) => {
                updatePlayer(player.id, {
                  rolledSpec: value,
                });
              });
            }}
          >
            Assign a Player a Spec
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => {
            const validPlayers = dps.filter((p) => p.role !== "tank");
            const index = Math.floor(Math.random() * validPlayers.length);

            let player = validPlayers[index];

            // If we can't find a dps to move to tank just pick a random one.
            if (!player) {
              const index = Math.floor(Math.random() * dps.length);

              player = dps[index];
            }

            const availableSpecs = availableSpecsForPlayer(player, "tank");

            roll(player, availableSpecs, (value) => {
              updatePlayer(player.id, {
                rolledSpec: value,
              });
            });
          }}
        >
          Move a <RoleDisplay role="dps" /> to <RoleDisplay role="tank" />
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const validPlayers = tank.filter((p) => p.role !== "healer");
            const index = Math.floor(Math.random() * validPlayers.length);

            let player = validPlayers[index];

            // If we can't find a tank to move to healer just pick a random one.
            if (!player) {
              const index = Math.floor(Math.random() * tank.length);

              player = tank[index];
            }

            const availableSpecs = availableSpecsForPlayer(player, "healer");

            roll(player, availableSpecs, (value) => {
              updatePlayer(player.id, {
                rolledSpec: value,
              });
            });
          }}
        >
          Move a <RoleDisplay role="tank" /> to <RoleDisplay role="healer" />
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const validPlayers = healer.filter((p) => p.role !== "dps");
            const index = Math.floor(Math.random() * validPlayers.length);

            let player = validPlayers[index];

            // If we can't find a healer to move to dps just pick a random one.
            if (!player) {
              const index = Math.floor(Math.random() * healer.length);

              player = healer[index];
            }

            const availableSpecs = availableSpecsForPlayer(player, "dps");

            roll(player, availableSpecs, (value) => {
              updatePlayer(player.id, {
                rolledSpec: value,
              });
            });
          }}
        >
          Move a <RoleDisplay role="healer" /> to <RoleDisplay role="dps" />
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const validPlayers = healer.filter((p) => p.role !== "tank");
            const index = Math.floor(Math.random() * validPlayers.length);

            let player = validPlayers[index];

            // If we can't find a healer to move to tank just pick a random one.
            if (!player) {
              const index = Math.floor(Math.random() * healer.length);

              player = healer[index];
            }

            const availableSpecs = availableSpecsForPlayer(player, "tank");

            roll(player, availableSpecs, (value) => {
              updatePlayer(player.id, {
                rolledSpec: value,
              });
            });
          }}
        >
          Move a <RoleDisplay role="healer" /> to <RoleDisplay role="tank" />
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const validPlayers = dps.filter((p) => p.role !== "healer");
            const index = Math.floor(Math.random() * validPlayers.length);

            let player = validPlayers[index];

            // If we can't find a dps to move to healer just pick a random one.
            if (!player) {
              const index = Math.floor(Math.random() * dps.length);

              player = dps[index];
            }

            const availableSpecs = availableSpecsForPlayer(player, "healer");

            roll(player, availableSpecs, (value) => {
              updatePlayer(player.id, {
                rolledSpec: value,
              });
            });
          }}
        >
          Move a <RoleDisplay role="dps" /> to <RoleDisplay role="healer" />
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const validPlayers = tank.filter((p) => p.role !== "dps");
            const index = Math.floor(Math.random() * validPlayers.length);

            let player = validPlayers[index];

            // If we can't find a tank to move to dps just pick a random one.
            if (!player) {
              const index = Math.floor(Math.random() * tank.length);

              player = tank[index];
            }

            const availableSpecs = availableSpecsForPlayer(player, "dps");

            roll(player, availableSpecs, (value) => {
              updatePlayer(player.id, {
                rolledSpec: value,
              });
            });
          }}
        >
          Move a <RoleDisplay role="tank" /> to <RoleDisplay role="dps" />
        </Button>
      </div>
    </>
  );
}
