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
import { sort } from "fast-sort";
import {
  ChevronDown,
  ChevronUp,
  Dices,
  Pencil,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  type FetcherWithComponents,
  Link,
  Outlet,
  data,
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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { TableBody } from "~/components/ui/table";
import { db } from "~/lib/db.server";
import { Role } from "~/lib/prisma";
import { AppSession } from "~/lib/session.server";
import type { Route } from "./lists/+types/route";

const ROLE_ORDER: Record<string, number> = {
  tank: 0,
  healer: 1,
  rdps: 2,
  mdps: 3,
  dps: 4,
};

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
        { status: 400 },
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
        { status: 404 },
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
          { status: 400 },
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
    <TableRow className="border-border/50 hover:bg-muted/30 transition-colors">
      <TableCell className="font-medium">{nickname}</TableCell>
      <TableCell>
        <ClassDisplay className="font-medium" classSpec={main} />
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
        <Button
          asChild
          className="h-8 px-2 text-muted-foreground hover:text-[#77B1D4] bg-none border-0"
          size="sm"
          variant="ghost"
        >
          <Link to={`/event/${slug}/edit/${player.id}/roll`}>
            <Dices className="h-4 w-4" />
            <span className="sr-only">Roll</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="h-8 px-2 text-muted-foreground hover:text-[#FFFF00]"
          size="sm"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          className="h-8 px-2 text-muted-foreground hover:text-destructive"
          size="sm"
          variant="ghost"
          onClick={() =>
            fetcher.submit(
              {
                action: "delete",
                id,
              },
              {
                method: "post",
              },
            )
          }
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
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
  const [isPlayerExpanded, setIsPlayersExpanded] = useState(true);
  const [isRosterExpanded, setIsRosterExpanded] = useState(true);
  const [sortBy, setSortBy] = useState<"team" | "role">("team");
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  type Player = (typeof event.players)[number];

  function sortPlayers(
    players: Player[],
    sortBy: "team" | "role",
    dir: "asc" | "desc",
  ) {
    if (sortBy === "team") {
      return sort(players).by([
        dir === "asc"
          ? { asc: (p) => p.team?.name ?? "zzz" }
          : { desc: (p) => p.team?.name ?? "zzz" },
        { asc: (p) => p.nickname ?? "" },
      ]);
    }

    if (sortBy === "role") {
      return sort(players).by([
        dir === "asc"
          ? { asc: (p) => ROLE_ORDER[p.assignedRole ?? ""] ?? 99 }
          : { desc: (p) => ROLE_ORDER[p.assignedRole ?? ""] ?? 99 },
        { asc: (p) => p.nickname ?? "" },
      ]);
    }

    return players;
  }
  return (
    <>
      <Outlet />
      <main className="container mx-auto px-8 py-8 max-w-32xl">
        <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Add a Player</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add a new player to the event roster
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 cursor-pointer"
                onClick={() => setIsPlayersExpanded(!isPlayerExpanded)}
              >
                {isPlayerExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardHeader>
          {isPlayerExpanded && (
            <CardContent>
              <CForm method="post" config={addPlayerForm}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm">Nickname *</p>
                    <CTextInput
                      label=""
                      config={addPlayerFields.nickname}
                      className="bg-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">Main Class *</p>
                    <ClassInput config={addPlayerFields.main} label="" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">Assigned Role *</p>
                    <RoleInput config={addPlayerFields.assignedRole} label="" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">Spec (if Setting Manually)</p>
                    <SpecInput config={addPlayerFields.spec} label="" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">Player Name (if known)</p>
                    <CTextInput config={addPlayerFields.playerName} label="" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">Player Server (if known)</p>
                    <CTextInput
                      config={addPlayerFields.playerServer}
                      label=""
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">Team (if Known)</p>
                    <CTextInput config={addPlayerFields.team} label="" />
                  </div>
                </div>
                <div className="mt-6 flex justify-start">
                  <div className="space-y-2">
                    <Button type="submit" name="action" value="add">
                      Add Player
                    </Button>
                  </div>
                </div>
              </CForm>
            </CardContent>
          )}
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Player Roster</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {event.players.length} players in the roster
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 cursor-pointer"
                onClick={() => setIsRosterExpanded(!isRosterExpanded)}
              >
                {isRosterExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardHeader>
          {isRosterExpanded && (
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">
                        Name
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Main
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        <div className="flex gap-2 items-center group">
                          Role
                          <button
                            className="flex items-center gap-1 text-muted-foreground group-hover:text-white transition-colors"
                            onClick={() => {
                              if (sortBy === "role") {
                                setDir(dir === "asc" ? "desc" : "asc");
                              } else {
                                setSortBy("role");
                                setDir("asc");
                              }
                            }}
                          >
                            {sortBy === "role" ? (
                              dir === "asc" ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )
                            ) : (
                              <ChevronUp className="w-4 h-4 opacity-30 group-hover:opacity-100" />
                            )}
                          </button>
                        </div>
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Spec
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Character
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Server
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        <div className="flex gap-2">
                          Team
                          <button
                            className="hover:text-white flex items-center gap-1"
                            onClick={() => {
                              if (sortBy === "team") {
                                setDir(dir === "asc" ? "desc" : "asc");
                              } else {
                                setSortBy("team");
                                setDir("asc");
                              }
                            }}
                          >
                            {sortBy === "team" ? (
                              dir === "asc" ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                              )
                            ) : (
                              <ChevronUp className="w-4 h-4 ml-1 opacity-30" />
                            )}
                          </button>
                        </div>
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortPlayers(event.players, sortBy, dir).map((p) => (
                      <PlayerRow key={p.id} player={p} slug={slug} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>
      </main>

      {/* <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Player</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{deleteConfirm?.nickname}</strong> from the roster? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  onDelete(deleteConfirm.id)
                  setDeleteConfirm(null)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </>
  );
}
