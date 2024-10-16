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

type Props = {
  selected: string;
};

function filterBySelected(data: LeaderboardResults[], value: string) {
  return value === "Overall"
    ? data
    : data.filter((item) => item.division === value);
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
          const resultsToDisplay = filterBySelected(resultsData, selected);
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

  // Calculate dynamic table width based on tournaments length
  const calculateTableWidth = () => {
    const fixedColumnsWidth = 416; // Width of the first 5 fixed columns (adjust as needed)
    const tournamentColumnsWidth = 128 * tournaments.length; // Width of tournament columns
    return fixedColumnsWidth + tournamentColumnsWidth;
  };

  return (
    <div className="relative w-full shadow-lg overflow-x-auto">
      <div className="w-full sm:w-[2336px] h-[1000px]">  {/* !!! Add 128px to width with each result upload !!! */}
        <Table className="bg-white dark:bg-zinc-800/50">
          <TableHeader className="bg-sky-900">
            <TableRow className="text-[11px] leading-3 uppercase h-20 hover:bg-inherit z-40">
              <TableHead className="text-center font-bold text-sky-50 dark:text-sky-100 bg-sky-900 z-40 sticky top-0 sm:left-0 sm:w-16 px-0 ">
                Pos
              </TableHead>
              <TableHead className="text-left font-bold text-sky-50 dark:text-sky-100 bg-sky-900 z-40 sticky top-0 sm:left-[64px] sm:w-40 px-0">
                Player
              </TableHead>
              <TableHead className="text-center font-bold text-sky-50 dark:text-sky-100 bg-sky-900 z-40 sticky top-0 sm:left-[224px] sm:w-16 px-0">
                Division
              </TableHead>
              <TableHead className="text-center font-bold text-sky-50 dark:text-sky-100 bg-sky-900 z-40 sticky top-0 sm:left-[288px] sm:w-16 px-0">
              <div className="flex flex-col gap-1 items-center justify-center">
                    <div className="">
                      Points
                    </div>
                    <div className="text-[10px] capitalize italic font-extralight">
                      lowest counting score
                    </div>
                  </div>
              </TableHead>
              <TableHead className="text-center font-bold hidden sm:table-cell landscape:table-cell text-sky-50 dark:text-sky-100 bg-sky-900 z-40 sticky top-0 sm:left-[352px] w-16 px-0">
                Events Played
              </TableHead>
              {tournaments.map((tournament) => (
                <TableHead
                  key={tournament.id}
                  className="font-bold text-center hidden sm:table-cell landscape:table-cell text-sky-50 dark:text-sky-100 w-32 bg-sky-900 sticky top-0 z-30"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div>{tournament.tournament_name}</div>
                    {tournament.isMajor && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white px-1 py-[1px] rounded-bl-md">
                        <p className="self-center capitalize text-[10px]">
                          major
                        </p>
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {results.map((result) => (
              <TableRow
                key={result.player_id}
                className="h-14 dark:border-b dark:border-b-zinc-600"
              >
                <TableCell className="text-center dark:bg-zinc-800 z-30 sticky left-0 w-16 px-0 bg-white">
                  {selected !== "Overall" ? result.division_placing : result.rank}
                </TableCell>
                <TableCell className="text-left dark:bg-zinc-800 z-30 sticky left-[64px] w-40 bg-white px-0">
                  {result.has_no_pdga_num ? (
                    <div>{result.name}</div>
                  ) : (
                    <Link
                      href={`https://www.pdga.com/player/${result.pdga_num}`}
                      target="_blank"
                    >
                      {result.name}
                    </Link>
                  )}
                </TableCell>
                <TableCell className="text-center dark:bg-zinc-800 z-30 sticky left-[224px] w-16 bg-white">
                  {result.division}
                </TableCell>
                <TableCell className="text-center font-medium dark:bg-zinc-800 z-30 sticky left-[288px] w-16 bg-white">
                  <div className="flex flex-col items-center justify-center">
                    <div className="font-medium text-sm">
                      {result.total_tour_points}
                    </div>
                    <div className="text-xs font-extralight italic">
                      {result.lowest_counting_score ? result.lowest_counting_score : '-'}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell landscape:table-cell dark:bg-zinc-800 z-30 sticky left-[352px] w-16 bg-white">
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
                          ? "bg-sky-50/75 dark:bg-zinc-700 hidden sm:table-cell landscape:table-cell w-32 z-30"
                          : "dark:bg-zinc-800 hidden sm:table-cell landscape:table-cell w-32 z-30"
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
                                : "text-xs font-extralight line-through dark:text-gray-400"
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
    </div>
  );
}
