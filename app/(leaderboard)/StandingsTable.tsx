"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeaderboardResults, Tournament } from "@/lib/types";
import { getLeaderboardData, getTournaments } from "@/db/queries";
import toast from "react-hot-toast";
import { formatOrdinals } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Props = {
  selected: string;
}

function filterBySelected(data: LeaderboardResults[], value: string) {
  if (value === "Overall") {
    return data
  } else {
    return data.filter((item) => item.division === value)
  }
}

export default function StandingsTable({ selected }: Props) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [results, setResults] = useState<LeaderboardResults[]>([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const tournamentsData = await getTournaments();
        if (tournamentsData) {
          setTournaments(tournamentsData);
        } else {
          toast.error("Failed to fetch tournaments.");
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        toast.error("Failed to fetch tournaments.");
      }
    };

    fetchTournaments();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const resultsData = await getLeaderboardData();
        if (resultsData) {
          const resultsToDisplay = filterBySelected(resultsData, selected)
          setResults(resultsToDisplay);
        } else {
          toast.error("Failed to fetch results.");
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Failed to fetch results.");
      }
    };

    fetchResults();
  }, [selected]);

  return (
    <div className="h-fit relative overflow-auto shadow-lg">
      <Table className="bg-white ">
        <TableHeader className="sticky top-0 bg-sky-900 ">
          <TableRow className="text-[11px] leading-3 uppercase h-16 hover:bg-inherit">
            <TableHead className="text-center font-bold text-sky-50">
              Pos
            </TableHead>
            <TableHead className="font-bold text-sky-50">
              Player
            </TableHead>
            <TableHead className="w-fit text-center font-bold text-sky-50">
              Division
            </TableHead>
            <TableHead className="text-center font-bold text-sky-50">
              Points
            </TableHead>
            <TableHead className="text-center font-bold collapse-md text-sky-50">
              Events Played
            </TableHead>
            {tournaments.map((tournament) => (
              <TableHead
                key={tournament.id}
                className="font-bold text-center collapse-md text-sky-50 w-32 relative"
              >
                  <div className="collapse-md">
                    {tournament.tournament_name}
                  </div>
                  {tournament.isMajor && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-1 py-[1px] rounded-bl-md">
                      <p className="self-center capitalize text-[10px]">major</p>
                    </div>
                  )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {results.map((result, index) => (
            <TableRow key={result.player_id} className="h-12">
              <TableCell className="text-center">{result.rank}</TableCell>
              <TableCell className="">
                <Link
                  href={`https://www.pdga.com/player/${result.pdga_num}`}
                  target="_blank"
                >
                  {result.name}
                </Link>
              </TableCell>
              <TableCell className="text-center">{result.division}</TableCell>
              <TableCell className="text-center font-medium">
                {result.total_tour_points}
              </TableCell>
              <TableCell className="text-center collapse-md">
                {result.events_played}
              </TableCell>
              {tournaments.map((tournament) => {
                const playerResult = result.player_results.find(
                  (pr) => pr.tournament_id === tournament.id
                );
                return (
                  <TableCell
                    key={tournament.id}
                    className={
                      playerResult && !playerResult?.is_counted
                        ? "bg-sky-50/75 collapse-md"
                        : "collapse-md"
                    }
                  >
                    {playerResult ? (
                      <div className="flex flex-col items-center justify-center">
                        <div
                          className={
                            playerResult.is_counted
                              ? "font-medium text-sm"
                              : "font-light text-gray-400"
                          }
                        >
                          {formatOrdinals(playerResult.overall_placing)}
                        </div>
                        <div
                          className={
                            playerResult.is_counted
                              ? "text-xs font-extralight"
                              : "text-xs font-extralight line-through"
                          }
                        >
                          ({playerResult.event_points})
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">-</div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
