import { ClassDisplay } from "~/components/display/classDisplay";
import { Route } from "../+types/route";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { RoleDisplay } from "~/components/display/roleDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useParams, Link } from "react-router";
import { CharacterName } from "~/components/display/characterName";

type Player = Route.ComponentProps["loaderData"]["event"]["players"][number];

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
    cell: ({ row }) => {
      const { slug } = useParams();
      const { id, nickname } = row.original;

      return <Link to={`/event/${slug}/player/${id}`}>{nickname}</Link>;
    },
  },
  {
    accessorKey: "main",
    header: ({ column }) => (
      <>
        Main
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <ArrowUpDown />
        </Button>
      </>
    ),
    cell: ({ row }) => {
      const { main } = row.original;
      return <ClassDisplay classSpec={main} />;
    },
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
        Player Name
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
      return <CharacterName name={playerName} server={playerServer} />;
    },
  },
  {
    accessorKey: "team.name",
    header: ({ column }) => (
      <>
        Team
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <ArrowUpDown />
        </Button>
      </>
    ),
    cell: ({ row }) => {
      const { team } = row.original;
      return team?.name ?? "unassigned";
    },
  },
  // {
  //   id: "actions",
  //   cell: ({ row, table }) => {
  //     const { slug } = useParams();
  //     const player = row.original;
  //     const { isEditing, setIsEditing } = (table.options.meta ?? {}) as {
  //       isEditing: string | null;
  //       setIsEditing: (id: string | null) => void;
  //     };

  //     if (isEditing === player.id) {
  //       return (
  //         <Button
  //           variant="ghost"
  //           className="h-8 w-8 p-0"
  //           onClick={() => setIsEditing(null)}
  //         >
  //           Done
  //         </Button>
  //       );
  //     } else {
  //       return (
  //         <DropdownMenu>
  //           <DropdownMenuTrigger asChild>
  //             <Button variant="ghost" className="h-8 w-8 p-0">
  //               <span className="sr-only">Open menu</span>
  //               <MoreHorizontal className="h-4 w-4" />
  //             </Button>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent align="end">
  //             <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //             <DropdownMenuItem asChild>
  //               <Link to={`/event/${slug}/edit/${player.id}/roll`}>Roll</Link>
  //             </DropdownMenuItem>
  //             <DropdownMenuItem onClick={() => setIsEditing(player.id)}>
  //               Edit
  //             </DropdownMenuItem>
  //             <DropdownMenuSeparator />
  //           </DropdownMenuContent>
  //         </DropdownMenu>
  //       );
  //     }
  //   },
  // },
] satisfies ColumnDef<Player>[];

export function PlayerDataTable({ players }: { players: Player[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const table = useReactTable({
    data: players,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    meta: {
      isEditing,
      setIsEditing: setIsEditing,
    },
  });

  return (
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
  );
}
