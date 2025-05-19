import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ClassDisplay } from "~/components/display/classDisplay";
import { H4 } from "~/components/display/headers";
import { RoleDisplay } from "~/components/display/roleDisplay";
import { ScoreDisplay } from "~/components/display/scoreDisplay";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  calculateBestMythicsAndTotalScore,
  calculateBestScoreAndBestUnderTime,
  MythicData,
} from "~/lib/mythics";
import { Route } from "../+types/route";

type Team = Route.ComponentProps["loaderData"]["event"]["teams"][number];

const columns = [
  {
    accessorKey: "nickname",
    header: ({ column }) => (
      <>
        Nickname
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <ArrowUpDown />
        </Button>
      </>
    ),
  },
  {
    accessorKey: "assignedRole",
    header: ({ column }) => (
      <>
        Assigned Role
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <ArrowUpDown />
        </Button>
      </>
    ),
    cell: ({ row }) => {
      const { assignedRole } = row.original;
      return <RoleDisplay playerRole={assignedRole} />;
    },
  },
  {
    accessorKey: "spec",
    header: ({ column }) => (
      <>
        Spec
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <ArrowUpDown />
        </Button>
      </>
    ),
    cell: ({ row }) => {
      const { spec } = row.original;
      return <ClassDisplay classSpec={spec} />;
    },
  },
  {
    accessorKey: "playerName",
    header: ({ column }) => (
      <>
        Player Character
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <ArrowUpDown />
        </Button>
      </>
    ),
    cell: ({ row }) => {
      const { playerName, playerServer } = row.original;
      return (
        <>
          {playerName}
          {playerServer ? ` - ${playerServer}` : null}
        </>
      );
    },
  },
] satisfies ColumnDef<Team["players"][number]>[];

function MythicsInfoOverview({ mythics }: { mythics: MythicData[] | null }) {
  if (!mythics) {
    return <MissingMythicInfo></MissingMythicInfo>;
  }

  const [bestMythics, bestMythicsScore] = useMemo(() => {
    return calculateBestMythicsAndTotalScore(mythics);
  }, [mythics]);

  const [bestSingleScore, mostUnderTime] = useMemo(() => {
    return calculateBestScoreAndBestUnderTime(mythics);
  }, [mythics]);

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <H4>Dungeons</H4>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 3xl:grid-cols-4 6xl:grid-cols-8 gap-2 w-full">
          {bestMythics.map((run) => (
            <div
              key={run.keystone_run_id}
              className="grow rounded-lg border-gray-100 border p-4 gap-2 bg-background/60 bg-(image:--bg-image) dark:bg-blend-darken bg-blend-lighten bg-linear-to-b bg-cover bg-no-repeat"
              style={{
                // @ts-expect-error: Variables are not typed
                "--bg-image": `url(${run.background_image_url})`,
              }}
            >
              <div className="flex flex-col items-center gap-y-2">
                <div className="flex flex-col justify-start text-3xl">
                  <ScoreDisplay individual score={run.score} className="" />
                </div>
                <div className="flex flex-row justify-evenly gap-4">
                  <p className="flex text-lg">+{run.mythic_level}</p>
                  <p className="flex text-lg">
                    {(
                      ((run.clear_time_ms - run.par_time_ms) /
                        run.par_time_ms) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                </div>
                <p className="text-xl font-bold">{run.short_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <H4>Total Team Score</H4>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 3xl:grid-cols-4 gap-2 w-full">
          <div className="rounded-lg border border-neutral-100 grow">
            <div className="flex flex-col items-center space-around pb-2 pt-2 ps-1 pe-1">
              <span className="text-4xl font-semibold">{mythics.length}</span>
              <span className="text-md font-bold">Mythics Ran</span>
            </div>
          </div>
          <div className="rounded-lg border border-neutral-100 grow">
            <div className="flex flex-col items-center space-around pb-2 pt-2 ps-1 pe-1">
              <ScoreDisplay
                score={bestMythicsScore}
                className="text-4xl font-semibold"
              />
              <span className="text-md font-bold">Team Score</span>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-100 grow">
            <div className="flex flex-col items-center space-around pb-2 pt-2 ps-1 pe-1">
              <ScoreDisplay
                score={bestSingleScore}
                individual
                className="text-4xl font-semibold"
              />
              <span className="text-md font-bold">Best Single Score</span>
            </div>
          </div>
          <div className="rounded-lg border border-neutral-100 grow">
            <div className="flex flex-col items-center space-around pb-2 pt-2 ps-1 pe-1">
              <span className="text-4xl font-semibold">
                {(mostUnderTime * 100).toFixed(2)}%
              </span>
              <span className="text-md font-bold">Best Under Par</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissingMythicInfo() {
  return (
    <div className="flex flex-col gap-4">
      <H4>Dungeons</H4>
      <p>No Mythic data available.</p>
    </div>
  );
}

export function TeamDataTable({
  team,
  slug,
  mythicData,
}: {
  team: Team;
  slug: string;
  mythicData: MythicData[] | null;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: team.players,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="p-4 border">
      <Link to={`/event/${slug}/team/${team.id}`} className="underline">
        <H4>{team.name}</H4>
      </Link>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {mythicData && mythicData.length > 0 ? (
        <MythicsInfoOverview mythics={mythicData} />
      ) : (
        <MissingMythicInfo />
      )}
    </div>
  );
}
