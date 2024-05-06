"use client";

import { LeaderboardRow } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";


export const columns: ColumnDef<LeaderboardRow>[] = [
  {
    accessorKey: "rank",
    header: "Pos",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "PDGANum",
    header: "PDGA#",
  },
  {
    accessorKey: "events_played",
    header: "Events Played",
  },
  {
    accessorKey: "total_tour_points",
    header: "Points",
    cell: ({ row }) => {
      const pointsTotal = row.original.total_tour_points.total;
      const best = row.original.total_tour_points.best;

      return (
        <div className="flex flex-col gap-2">
          <div>{pointsTotal ? pointsTotal : "-"}</div>
          <div>{best}</div>
        </div>
      );
    },
  },
];
