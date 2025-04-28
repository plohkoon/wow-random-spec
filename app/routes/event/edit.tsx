import { db } from "~/lib/db.server";
import { Route } from "./+types/show";
import {
  TableHead,
  TableHeader,
  TableRow,
  Table,
  TableCell,
} from "app/components/ui/table";
import { TableBody } from "~/components/ui/table";
import { H2, H3 } from "~/components/display/headers";
import { z } from "zod";
import { CForm } from "~/components/inputs/form";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { CTextInput } from "~/components/inputs/textInput";
import { Button } from "app/components/ui/button";
import { ClassDisplay } from "~/components/display/classDisplay";
import { Role } from "~/lib/prisma";
import { useEffect, useState } from "react";
import { CHiddenInput } from "~/components/inputs/hiddenInput";
import { data, Link, useFetcher } from "react-router";
import { ClassInput } from "~/components/inputs/classInput";
import { RoleDisplay } from "~/components/display/roleDisplay";

const addPlayerSchema = z.object({
  nickname: z.string().min(1, "Nickname is required"),
  main: z.string().optional(),
  assignedRole: z.nativeEnum(Role).optional(),
  spec: z.string().optional(),
  team: z.string().optional(),
  playerName: z.string().optional(),
  action: z.literal("add"),
});

const updatePlayerSchema = z.object({
  id: z.string(),
  nickname: z.string().min(1, "Nickname is required"),
  main: z.string().optional(),
  assignedRole: z.nativeEnum(Role).optional(),
  spec: z.string().optional(),
  team: z.string().optional(),
  playerName: z.string().optional(),
  action: z.literal("update"),
});

const schema = z.union([addPlayerSchema, updatePlayerSchema]);

export async function loader({ params: { slug } }: Route.LoaderArgs) {
  const event = await db.event.findUnique({
    where: { slug },
    include: {
      players: {
        include: {
          team: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    throw new Response("Not Found", { status: 404 });
  }

  return { event };
}

export async function action({ request, params: { slug } }: Route.ActionArgs) {
  const fData = await request.formData();

  const res = await parseWithZod(fData, {
    schema,
  });

  if (res.status !== "success") {
    return res.reply();
  }

  const event = await db.event.findUnique({
    where: { slug },
  });
  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  let teamId;

  if (res.value.team) {
    let team = await db.team.findFirst({
      where: { name: res.value.team, eventId: event.id },
    });
    if (!team) {
      team = await db.team.create({
        data: {
          name: res.value.team,
          eventId: event.id,
        },
      });
    }

    teamId = team.id;
  }

  const { value } = res;

  if (value.action === "add") {
    const existingPlayer = await db.player.findFirst({
      where: {
        nickname: value.nickname,
        eventId: event.id,
      },
    });

    if (existingPlayer) {
      return data(
        res.reply({
          formErrors: [`Player with nickname ${value.nickname} already exists`],
        }),
        { status: 400 }
      );
    }

    await db.player.create({
      data: {
        nickname: value.nickname,
        main: value.main,
        assignedRole: value.assignedRole,
        spec: value.spec,
        teamId,
        eventId: event.id,
      },
    });
  } else if (value.action === "update") {
    const existingPlayer = await db.player.findUnique({
      where: {
        id: value.id,
      },
    });

    if (!existingPlayer) {
      return data(
        res.reply({ formErrors: [`Player with id ${value.id} not found`] }),
        { status: 404 }
      );
    }

    if (existingPlayer.nickname !== value.nickname) {
      const existingPlayerWithNickname = await db.player.findFirst({
        where: {
          nickname: value.nickname,
          eventId: event.id,
        },
      });

      if (existingPlayerWithNickname) {
        return data(
          res.reply({
            formErrors: [
              `Player with nickname ${value.nickname} already exists`,
            ],
          }),
          { status: 400 }
        );
      }
    }

    await db.player.update({
      where: { id: existingPlayer.id },
      data: {
        nickname: value.nickname,
        main: value.main,
        assignedRole: value.assignedRole,
        spec: value.spec,
        teamId,
        playerName: value.playerName,
      },
    });
  }

  return res.reply();
}

function PlayerRow({
  player,
}: {
  player: Route.ComponentProps["loaderData"]["event"]["players"][number];
}) {
  const fetcher = useFetcher();

  const [editing, setEditing] = useState(false);

  const { id, nickname, main, assignedRole, spec, team, playerName } = player;

  const [form, fields] = useForm({
    id: `update-player-${player.id}`,
    defaultValue: {
      id: id,
      nickname: nickname,
      main: main,
      assignedRole: assignedRole,
      spec: spec,
      team: team?.name ?? "",
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updatePlayerSchema });
    },
  });

  useEffect(() => {
    if (fetcher.state === "idle") {
      setEditing(false);
    }
  }, [fetcher.state]);

  return (
    <TableRow>
      <TableCell>
        {editing ? (
          <CTextInput config={fields.nickname} label="" form={form.id} />
        ) : (
          nickname
        )}
      </TableCell>
      <TableCell>
        {editing ? (
          <ClassInput config={fields.main} form={form.id} />
        ) : (
          <ClassDisplay classSpec={main} />
        )}
      </TableCell>
      <TableCell>
        <RoleDisplay playerRole={assignedRole} />
      </TableCell>
      <TableCell>
        <ClassDisplay classSpec={spec} />
      </TableCell>
      <TableCell>
        {editing ? (
          <CTextInput config={fields.playerName} label="" form={form.id} />
        ) : (
          playerName
        )}
      </TableCell>
      <TableCell>{team?.name ?? "unassigned"}</TableCell>
      <TableCell>
        <Button asChild variant="default">
          <Link to={`/event/${player.eventId}/roll/${player.id}`}>Roll</Link>
        </Button>
        {editing ? (
          <>
            <CForm method="post" config={form} fetcher={fetcher}>
              <CHiddenInput config={fields.id} />
              <Button type="submit" name="action" value="update">
                Save
              </Button>
            </CForm>
          </>
        ) : (
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function EventEdit({
  loaderData: { event },
}: Route.ComponentProps) {
  const [addPlayerForm, addPlayerFields] = useForm({
    id: "add-player",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: addPlayerSchema });
    },
  });

  return (
    <main className="space-y-4">
      <H2>{event.name}</H2>

      <section>
        <H3>Players</H3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Normal Main</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Spec</TableHead>
              <TableHead>Character Name</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {event.players.map((p) => {
              return <PlayerRow key={p.id} player={p} />;
            })}
          </TableBody>
        </Table>
      </section>

      <section>
        <H3>Add a Player</H3>

        <CForm method="post" config={addPlayerForm}>
          <CTextInput config={addPlayerFields.nickname} label="Nickname" />
          <CTextInput config={addPlayerFields.main} label="Normal Main" />
          <CTextInput
            config={addPlayerFields.assignedRole}
            label="Assigned Role"
          />
          <CTextInput config={addPlayerFields.spec} label="Spec" />
          <CTextInput config={addPlayerFields.team} label="Team" />

          <Button type="submit" name="action" value="add">
            Add Player
          </Button>
        </CForm>
      </section>
    </main>
  );
}
