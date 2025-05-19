import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Button } from "app/components/ui/button";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "app/components/ui/table";
import { useEffect, useState } from "react";
import {
  data,
  FetcherWithComponents,
  Link,
  Outlet,
  useFetcher,
} from "react-router";
import { z } from "zod";
import { ClassDisplay } from "~/components/display/classDisplay";
import { H3 } from "~/components/display/headers";
import { RoleDisplay } from "~/components/display/roleDisplay";
import { ClassInput } from "~/components/inputs/classInput";
import { CForm } from "~/components/inputs/form";
import { CHiddenInput } from "~/components/inputs/hiddenInput";
import { RoleInput } from "~/components/inputs/roleInput";
import { SpecInput } from "~/components/inputs/specInput";
import { CTextInput } from "~/components/inputs/textInput";
import { TableBody } from "~/components/ui/table";
import { db } from "~/lib/db.server";
import { Role } from "~/lib/prisma";
import { AppSession } from "~/lib/session.server";
import { Route } from "./lists/+types/route";

const addPlayerSchema = z.object({
  nickname: z.string().min(1, "Nickname is required"),
  main: z.string().optional(),
  assignedRole: z.nativeEnum(Role).optional(),
  spec: z.string().optional(),
  team: z.string().optional(),
  playerName: z.string().optional(),
  playerServer: z.string().optional(),
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
  playerServer: z.string().optional(),
  action: z.literal("update"),
});

const deletePlayerSchema = z.object({
  id: z.string(),
  action: z.literal("delete"),
});

const schema = z.union([
  addPlayerSchema,
  updatePlayerSchema,
  deletePlayerSchema,
]);

export async function loader({ request, params: { slug } }: Route.LoaderArgs) {
  const session = await AppSession.fromRequest(request);
  await session.requireAdmin(`/event/${slug}`);

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
  const session = await AppSession.fromRequest(request);
  await session.requireAdmin(`/event/${slug}`);

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

    let teamId;
    if (value.team) {
      let team = await db.team.findFirst({
        where: { name: value.team, eventId: event.id },
      });
      if (!team) {
        team = await db.team.create({
          data: {
            name: value.team,
            eventId: event.id,
          },
        });
      }

      teamId = team.id;
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

    let teamId;
    if (value.team) {
      let team = await db.team.findFirst({
        where: { name: value.team, eventId: event.id },
      });
      if (!team) {
        team = await db.team.create({
          data: {
            name: value.team,
            eventId: event.id,
          },
        });
      }

      teamId = team.id;
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
        playerServer: value.playerServer,
      },
    });

    // Cleanup leftover teams if all players are removed.
    if (
      existingPlayer?.teamId &&
      (await db.player.count({ where: { teamId: existingPlayer.teamId } })) ===
        0
    ) {
      await db.team.delete({ where: { id: existingPlayer.teamId } });
    }
  } else if (value.action === "delete") {
    const player = await db.player.delete({
      where: {
        id: value.id,
      },
    });

    if (
      player?.teamId &&
      (await db.player.count({ where: { teamId: player.teamId } })) === 0
    ) {
      await db.team.delete({ where: { id: player.teamId } });
    }
  }

  return res.reply();
}

function EditPlayerRow({
  player,
  fetcher,
}: {
  player: Route.ComponentProps["loaderData"]["event"]["players"][number];
  fetcher: FetcherWithComponents<any>;
}) {
  const {
    id,
    nickname,
    main,
    assignedRole,
    spec,
    team,
    playerName,
    playerServer,
  } = player;

  const [form, fields] = useForm({
    id: `update-player-${player.id}`,
    defaultValue: {
      id: id,
      nickname: nickname,
      main: main,
      assignedRole: assignedRole,
      spec: spec,
      playerName,
      playerServer,
      team: team?.name ?? "",
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updatePlayerSchema });
    },
  });

  return (
    <TableRow>
      <TableCell>
        <CTextInput config={fields.nickname} label="" form={form.id} />
      </TableCell>
      <TableCell>
        <ClassInput config={fields.main} form={form.id} label="" />
      </TableCell>
      <TableCell>
        <RoleInput config={fields.assignedRole} form={form.id} label="" />
      </TableCell>
      <TableCell>
        <SpecInput config={fields.spec} form={form.id} label="" />
      </TableCell>
      <TableCell>
        <CTextInput config={fields.playerName} label="" form={form.id} />
      </TableCell>
      <TableCell>
        <CTextInput config={fields.playerServer} label="" form={form.id} />
      </TableCell>
      <TableCell>
        <CTextInput config={fields.team} label="" form={form.id} />
      </TableCell>
      <TableCell>
        <CForm method="post" config={form} fetcher={fetcher}>
          <CHiddenInput config={fields.id} />
          <Button type="submit" name="action" value="update">
            Save
          </Button>
        </CForm>
      </TableCell>
    </TableRow>
  );
}

function PlayerRow({
  player,
  slug,
}: {
  player: Route.ComponentProps["loaderData"]["event"]["players"][number];
  slug: string;
}) {
  const fetcher = useFetcher();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (fetcher.state === "idle") {
      setEditing(false);
    }
  }, [fetcher.state]);

  if (editing) {
    return <EditPlayerRow player={player} fetcher={fetcher} />;
  }

  const {
    id,
    nickname,
    main,
    assignedRole,
    spec,
    team,
    playerName,
    playerServer,
  } = player;

  return (
    <TableRow>
      <TableCell>{nickname}</TableCell>
      <TableCell>
        <ClassDisplay classSpec={main} />
      </TableCell>
      <TableCell>
        <RoleDisplay playerRole={assignedRole} />
      </TableCell>
      <TableCell>
        <ClassDisplay classSpec={spec} />
      </TableCell>
      <TableCell>{playerName}</TableCell>
      <TableCell>{playerServer}</TableCell>
      <TableCell>{team?.name ?? "unassigned"}</TableCell>
      <TableCell>
        <Button asChild variant="default">
          <Link to={`/event/${slug}/edit/${player.id}/roll`}>Roll</Link>
        </Button>
        <Button variant="secondary" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            fetcher.submit(
              {
                action: "delete",
                id,
              },
              {
                method: "post",
              }
            )
          }
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}

export const handle = {
  edit: true,
};

export default function EventEdit({
  loaderData: { event },
  params: { slug },
}: Route.ComponentProps) {
  const [addPlayerForm, addPlayerFields] = useForm({
    id: "add-player",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: addPlayerSchema });
    },
  });

  return (
    <>
      <Outlet />
      <article className="space-y-4">
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
                <TableHead>Character Server</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {event.players.map((p) => {
                return <PlayerRow key={p.id} player={p} slug={slug} />;
              })}
            </TableBody>
          </Table>
        </section>

        <section>
          <H3>Add a Player</H3>

          <CForm
            method="post"
            config={addPlayerForm}
            className="grid gap-4 grid-cols-1 sm:grid-cols-2"
          >
            <fieldset className="space-y-2">
              <CTextInput config={addPlayerFields.nickname} label="Nickname" />
              <ClassInput config={addPlayerFields.main} label="Main Class" />
              <RoleInput
                config={addPlayerFields.assignedRole}
                label="Assigned Role"
              />
            </fieldset>
            <fieldset className="space-y-2">
              <CTextInput
                config={addPlayerFields.playerName}
                label="Player Name (if known)"
              />
              <CTextInput
                config={addPlayerFields.playerServer}
                label="Player Server (if known)"
              />
              <SpecInput
                config={addPlayerFields.spec}
                label="Spec (if Setting Manually)"
              />
              <CTextInput
                config={addPlayerFields.team}
                label="Team (if Known)"
              />
            </fieldset>

            <Button type="submit" name="action" value="add">
              Add Player
            </Button>
          </CForm>
        </section>
      </article>
    </>
  );
}
