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

export default function StandingsTable() {
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
          setResults(resultsData);
        } else {
          toast.error("Failed to fetch results.");
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Failed to fetch results.");
      }
    };

    fetchResults();
  }, []);

  return (
      <div className="h-screen relative overflow-auto shadow-lg ">
      <Table className="bg-white">
        <TableHeader className="sticky top-0 bg-white ">
          <TableRow className="text-[11px] leading-3 uppercase h-16 ">
            <TableHead className="text-center font-bold">Pos</TableHead>
            <TableHead className="w-fit font-bold">Player</TableHead>
            <TableHead className="w-fit text-center font-bold">Division</TableHead>
            <TableHead className="text-center font-bold">Points</TableHead>
            <TableHead className="text-center font-bold">Events</TableHead>
            {tournaments.map((tournament) => (
              <TableHead key={tournament.id} className="text-center w-28 font-bold invisible md:visible">
                <div>{tournament.tournament_name}</div>
              </TableHead>
            ))}
            </TableRow>
        </TableHeader>

        <TableBody>
          {results.map((result, index) => (
            <TableRow key={result.player_id}>
              <TableCell className="text-center">{result.rank}</TableCell>
              <TableCell className="w-fit">{result.name}</TableCell>
              <TableCell className="text-center">{result.player_results[0].division}</TableCell>
              <TableCell className="text-center">
                {result.total_tour_points}
              </TableCell>
              <TableCell className="text-center">
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
                        ? "bg-sky-50/75 invisible md:visible"
                        : "invisible md:visible"
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
