import { availableSpecsForPlayer } from "@/lib/classes";
import { usePinwheelState } from "@/lib/pinwheelState";
import { useState } from "react";
import { type PlayerType, usePlayers } from "../lib/usePlayers";
import { ClassDisplay } from "./classDisplay";
import { ClassInput } from "./classInput";
import { RoleDisplay } from "./roleDisplay";
import { RoleInput } from "./roleInput";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";

function PlayerRow({ player }: { player: PlayerType }) {
  const { updatePlayer, deletePlayer } = usePlayers();
  const { roll } = usePinwheelState();
  const [editing, setEditing] = useState<boolean>();

  const { id, name, main, role, rolledSpec = "n/a", team = "n/a" } = player;

  const formId = `form-${id}`;

  const availableSpecs = availableSpecsForPlayer(player);

  return (
    <TableRow>
      <TableCell className="font-bold">
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault();
            setEditing((p) => !p);
          }}
        />
        {editing ? (
          <Input
            defaultValue={name}
            onChange={(e) => {
              e.preventDefault();
              updatePlayer(id, {
                name: e.currentTarget.value,
              });
            }}
            form={formId}
          />
        ) : (
          name
        )}
      </TableCell>
      <TableCell>
        {editing ? (
          <ClassInput
            defaultValue={main}
            form={formId}
            onChange={(v) =>
              updatePlayer(id, {
                main: v,
              })
            }
          />
        ) : (
          <ClassDisplay classSpec={main} />
        )}
      </TableCell>
      <TableCell>
        {editing ? (
          <RoleInput
            defaultValue={role}
            form={formId}
            onChange={(v) =>
              updatePlayer(id, {
                role: v,
              })
            }
          />
        ) : (
          <RoleDisplay role={role} />
        )}
      </TableCell>
      <TableCell>
        <ClassDisplay classSpec={rolledSpec} />
      </TableCell>
      <TableCell>
        {editing ? (
          <Input
            defaultValue={team}
            onChange={(e) => {
              e.preventDefault();
              updatePlayer(id, {
                team: e.currentTarget.value,
              });
            }}
            form={formId}
          />
        ) : (
          team
        )}
      </TableCell>
      <TableCell className="flex flex-row space-x-1">
        {editing ? (
          <Button form={formId} variant="default">
            Done
          </Button>
        ) : (
          <>
            <Button
              variant="default"
              onClick={() =>
                roll(player, availableSpecs, (value) =>
                  updatePlayer(id, {
                    rolledSpec: value,
                  })
                )
              }
            >
              Roll Spec
            </Button>
            <Button form={formId} variant="secondary">
              Change
            </Button>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                deletePlayer(id);
              }}
            >
              Remove
            </Button>
          </>
        )}
      </TableCell>
    </TableRow>
  );
}

export function PlayerTable() {
  const { players } = usePlayers();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Normal Main</TableHead>
          <TableHead>Assigned Role</TableHead>
          <TableHead>Spec</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((p) => (
          <PlayerRow key={p.id} player={p} />
        ))}
      </TableBody>
    </Table>
  );
}
