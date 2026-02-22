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
import { EventStatus, Role, SyncLog } from "~/lib/prisma";
import { AppSession } from "~/lib/session.server";
import { syncEvent, syncPlayer } from "~/lib/sync.server";
import { Route } from "./lists/+types/route";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ChevronDown, ChevronUp, Dices, Loader2, Pencil, RefreshCw, Settings, Trash2, UserPlus, Users } from "lucide-react";
import { sort } from "fast-sort";

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

const updateEventSchema = z.object({
  startDate: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  endDate: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  status: z.nativeEnum(EventStatus).optional(),
  action: z.literal("updateEvent"),
});

const forceSyncSchema = z.object({
  action: z.literal("forceSync"),
});

const schema = z.union([
  addPlayerSchema,
  updatePlayerSchema,
  deletePlayerSchema,
  updateEventSchema,
  forceSyncSchema,
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

  const lastSync = await db.syncLog.findFirst({
    where: { eventId: event.id },
    orderBy: { startedAt: "desc" },
  });

  return { event, lastSync };
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

    const newPlayer = await db.player.create({
      data: {
        nickname: value.nickname,
        main: value.main,
        assignedRole: value.assignedRole,
        spec: value.spec,
        playerName: value.playerName,
        playerServer: value.playerServer,
        teamId,
        eventId: event.id,
      },
    });

    // Immediately sync the new player in the background
    if (value.playerName && value.playerServer) {
      syncPlayer(
        { id: newPlayer.id, playerName: value.playerName, playerServer: value.playerServer },
        { after: event.startDate, before: event.endDate }
      ).then(({ runsUpserted }) => {
        console.log(`[EditSync] Synced new player ${value.playerName}: ${runsUpserted} runs`);
      }).catch((err) => {
        console.error(`[EditSync] Failed to sync ${value.playerName}:`, err);
      });
    }
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

    // Sync if playerName/playerServer was added or changed
    const nameChanged = value.playerName !== existingPlayer.playerName
      || value.playerServer !== existingPlayer.playerServer;
    if (nameChanged && value.playerName && value.playerServer) {
      syncPlayer(
        { id: existingPlayer.id, playerName: value.playerName, playerServer: value.playerServer },
        { after: event.startDate, before: event.endDate }
      ).then(({ runsUpserted }) => {
        console.log(`[EditSync] Synced updated player ${value.playerName}: ${runsUpserted} runs`);
      }).catch((err) => {
        console.error(`[EditSync] Failed to sync ${value.playerName}:`, err);
      });
    }

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
  } else if (value.action === "updateEvent") {
    const updateData: Record<string, unknown> = {};
    if (value.startDate !== undefined) updateData.startDate = value.startDate;
    if (value.endDate !== undefined) updateData.endDate = value.endDate;
    if (value.status !== undefined) updateData.status = value.status;

    await db.event.update({
      where: { id: event.id },
      data: updateData,
    });
  } else if (value.action === "forceSync") {
    await syncEvent(event.id, { force: true });
  }

  return res.reply();
}

function SyncCard({ lastSync }: { lastSync: SyncLog | null }) {
  const fetcher = useFetcher();
  const isSyncing = fetcher.state !== "idle";

  const statusColors: Record<string, string> = {
    COMPLETED: "text-green-400",
    RUNNING: "text-yellow-400",
    PARTIAL: "text-yellow-400",
    FAILED: "text-red-400",
  };

  return (
    <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Data Sync</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sync player profiles and M+ runs from RaiderIO
              </p>
            </div>
          </div>
          <fetcher.Form method="post">
            <Button
              type="submit"
              name="action"
              value="forceSync"
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Force Sync
                </>
              )}
            </Button>
          </fetcher.Form>
        </div>
      </CardHeader>
      {lastSync && (
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className={`font-medium ${statusColors[lastSync.status] ?? ""}`}>
                {lastSync.status}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Synced</p>
              <p className="font-medium">
                {lastSync.completedAt
                  ? new Date(lastSync.completedAt).toLocaleString()
                  : lastSync.startedAt
                    ? new Date(lastSync.startedAt).toLocaleString()
                    : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Players Synced</p>
              <p className="font-medium">{lastSync.playersSynced}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Runs Upserted</p>
              <p className="font-medium">{lastSync.runsUpserted}</p>
            </div>
          </div>
          {lastSync.durationMs != null && (
            <p className="text-xs text-muted-foreground mt-3">
              Completed in {(lastSync.durationMs / 1000).toFixed(1)}s
            </p>
          )}
          {lastSync.errorMessage && (
            <p className="text-xs text-red-400 mt-2 truncate" title={lastSync.errorMessage}>
              Errors: {lastSync.errorMessage}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
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
        <Button asChild className="h-8 px-2 text-muted-foreground hover:text-[#77B1D4] bg-none border-0" size="sm" variant="ghost">
          <Link to={`/event/${slug}/edit/${player.id}/roll`}>
            <Dices className="h-4 w-4" />
            <span className="sr-only">Roll</span></Link>
        </Button>
        <Button variant="ghost" className="h-8 px-2 text-muted-foreground hover:text-[#FFFF00]" size="sm" onClick={() => setEditing(true)}>
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
              }
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
  loaderData,
  params: { slug },
}: Route.ComponentProps) {
  const { event } = loaderData;
  const lastSync = (loaderData as any).lastSync as SyncLog | null;
  const [addPlayerForm, addPlayerFields] = useForm({
    id: "add-player",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: addPlayerSchema });
    },
  });
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isPlayerExpanded, setIsPlayersExpanded] = useState(true);
  const [isRosterExpanded, setIsRosterExpanded] = useState(true);
  const [sortBy, setSortBy] = useState<"team" | "role">("team");
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  type Player = typeof event.players[number];

  function sortPlayers(players: Player[], sortBy: "team" | "role", dir: "asc" | "desc") {
    if (sortBy === "team") {
      return sort(players).by([
        dir === "asc"
          ? { asc: p => p.team?.name ?? "zzz" }
          : { desc: p => p.team?.name ?? "zzz" },
        { asc: p => p.nickname ?? "" }
      ]);
    }

    if (sortBy === "role") {
      return sort(players).by([
        dir === "asc"
          ? { asc: p => ROLE_ORDER[p.assignedRole ?? ""] ?? 99 }
          : { desc: p => ROLE_ORDER[p.assignedRole ?? ""] ?? 99 },
        { asc: p => p.nickname ?? "" }
      ]);
    }

    return players;
  }
  const eventFetcher = useFetcher();

  const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().slice(0, 16);
  };

  return (
    <>
      <Outlet />
      <main className="container mx-auto px-8 py-8 max-w-32xl">
        <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Event Settings</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {event.name} &mdash; Status: {event.status ?? "ACTIVE"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 cursor-pointer" onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}>
                {isSettingsExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardHeader>
          {isSettingsExpanded && (
            <CardContent>
              <eventFetcher.Form method="post">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
                    <input
                      type="datetime-local"
                      id="startDate"
                      name="startDate"
                      defaultValue={formatDateForInput(event.startDate)}
                      className="flex h-10 w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      name="endDate"
                      defaultValue={formatDateForInput(event.endDate)}
                      className="flex h-10 w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={event.status ?? "ACTIVE"}
                      className="flex h-10 w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ENDED">Ended</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-start">
                  <Button type="submit" name="action" value="updateEvent">
                    Save Event Settings
                  </Button>
                </div>
              </eventFetcher.Form>
            </CardContent>
          )}
        </Card>

        <SyncCard lastSync={lastSync} />

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
              <Button variant="ghost" size="icon" className="shrink-0 cursor-pointer" onClick={() => setIsPlayersExpanded(!isPlayerExpanded)}>
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
                    <CTextInput label="" config={addPlayerFields.nickname} className="bg-input" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">Main Class *</p>
                    <ClassInput config={addPlayerFields.main} label="" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">Assigned Role *</p>
                    <RoleInput
                      config={addPlayerFields.assignedRole}
                      label=""
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">Spec (if Setting Manually)</p>
                    <SpecInput
                      config={addPlayerFields.spec}
                      label=""
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">Player Name (if known)</p>
                    <CTextInput
                      config={addPlayerFields.playerName}
                      label=""
                    />
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
                    <CTextInput
                      config={addPlayerFields.team}
                      label=""
                    />
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
              <Button variant="ghost" size="icon" className="shrink-0 cursor-pointer" onClick={() => setIsRosterExpanded(!isRosterExpanded)}
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
                              dir === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
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
                              dir === "asc" ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
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
                    {sortPlayers(event.players, sortBy, dir).map(p => (
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
