import { useState } from "react";
import { type PlayerType, usePlayers } from "../lib/usePlayers";
import { ClassInput } from "./classInput";
import { RoleInput } from "./roleInput";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";

function PlayerRow({ player }: { player: PlayerType }) {
  const { updatePlayer, deletePlayer } = usePlayers();
  const [editing, setEditing] = useState<boolean>();

  const {
    id,
    name,
    score,
    main,
    role,
    rolledSpec = "n/a",
    team = "n/a",
  } = player;

  const formId = `form-${id}`;

  return (
    <TableRow>
      <TableCell>
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault();
            setEditing((p) => !p);
          }}
        />
        {editing ? (
          <input
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
          <input
            type="number"
            defaultValue={score}
            form={formId}
            onChange={(e) => {
              e.preventDefault();
              updatePlayer(id, {
                score: parseInt(e.currentTarget.value),
              });
            }}
          />
        ) : (
          <span>{score}</span>
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
          main
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
          role
        )}
      </TableCell>
      <TableCell>{rolledSpec}</TableCell>
      <TableCell>{team}</TableCell>
      <TableCell className="flex flex-row space-x-1">
        <Button variant="default">Roll Spec</Button>
        <Button form={formId} variant="secondary">
          {editing ? "Done" : "Change"}
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
          <TableHead>Score</TableHead>
          <TableHead>Normal Main</TableHead>
          <TableHead>Normal Role</TableHead>
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
