import { useState } from "react";
import { type PlayerType, usePlayers } from "../lib/usePlayers";
import { ClassInput } from "./classInput";
import { RoleInput } from "./rolInput";

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
    <tr>
      <td>
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
      </td>
      <td>
        {editing ? (
          <input
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
          score
        )}
      </td>
      <td>
        {editing ? (
          <ClassInput
            defaultValue={main}
            form={formId}
            onChange={(e) => {
              e.preventDefault();
              updatePlayer(id, {
                main: e.currentTarget.value,
              });
            }}
          />
        ) : (
          main
        )}
      </td>
      <td>
        {editing ? (
          <RoleInput
            defaultValue={role}
            form={formId}
            onChange={(e) => {
              e.preventDefault();
              updatePlayer(id, {
                role: e.currentTarget.value,
              });
            }}
          />
        ) : (
          role
        )}
      </td>
      <td>{rolledSpec}</td>
      <td>{team}</td>
      <td>
        <button form={formId}>{editing ? "Done" : "Change"}</button>
        <button
          onClick={(e) => {
            e.preventDefault();
            deletePlayer(id);
          }}
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

export function PlayerTable() {
  const { players } = usePlayers();

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Score</th>
          <th>Normal Main</th>
          <th>Normal Role</th>
          <th>Spec</th>
          <th>Team</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {players.map((p) => (
          <PlayerRow key={p.id} player={p} />
        ))}
      </tbody>
    </table>
  );
}
