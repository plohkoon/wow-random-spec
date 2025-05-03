import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Route } from "../+types/route";
import { ClassDisplay } from "~/components/display/classDisplay";
import { RoleDisplay } from "~/components/display/roleDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { H4 } from "~/components/display/headers";
import { Button } from "~/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

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

export function TeamDataTable({ team, slug }: { team: Team; slug: string }) {
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
      <Link to={`/event/${slug}/team/${team.id}`}>
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
    </div>
  );
}
