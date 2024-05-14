"use client";

import { Player } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, ArrowUpDown } from "lucide-react";
import toast from "react-hot-toast";

export const columns: ColumnDef<Player>[] = [
  {
    id: "Name",
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
          </div>
          {column.getIsSorted() && <ArrowUpDown className="h-3 w-3" />}
        </div>
      );
    },
  },
  {
    accessorKey: "pdga_num",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PDGA #
          </div>
          {column.getIsSorted() && <ArrowUpDown className="h-3 w-3" />}
        </div>
      );
    },
  },
  {
    accessorKey: "division",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Division
          </div>
          {column.getIsSorted() && <ArrowUpDown className="h-3 w-3" />}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const player = row.original;

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.success(`${player.id}`)}
                className="flex gap-1 items-center align-middle justify-center"
              >
                <Pencil className="w-3 h-3" />
                Edit Player Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
        </>
      );
    },
  },
];
