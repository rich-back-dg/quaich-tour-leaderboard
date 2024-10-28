"use client";

import { getChampionData, getDivisionsList } from "@/db/queries";
import { Division, LeaderboardResults } from "@/lib/types";
import { divisionsSortedByRank } from "@/lib/utils";
import { LucideInfo } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PodiumCard from "./PodiumCard";
import ChampCard from "./ChampCard";

const defaultChampion: LeaderboardResults = {
  player_id: "",
  events_played: 0,
  total_tour_points: 0,
  player_results: [],
  rank: 0,
  name: "",
  first_name: "",
  last_name: "",
  pdga_num: "",
  id: "",
  division: "",
  has_no_pdga_num: false,
  lowest_counting_score: 0,
  division_placing: 0
};

export default function page() {
  const [divisionsList, setDivisionsList] = useState<Division[]>([]);
  const [champion, setChampion] = useState<LeaderboardResults>(defaultChampion);

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const divisions = await getDivisionsList();
        if (divisions) {
          const sortedDivisionList = divisions.sort(divisionsSortedByRank);
          setDivisionsList(sortedDivisionList);
        } else {
          toast.error("Failed to fetch results.");
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Failed to fetch results.");
      }
    };

    fetchDivisions();
  }, []);

  useEffect(() => {
    const fetchChampion = async () => {
      try {
        const champData = await getChampionData()
        if (champData) {
          setChampion(champData);
        } else {
          toast.error("Failed to fetch champion data.");
        }
      } catch (error) {
        console.error("Error fetching champion data:", error);
        toast.error("Failed to fetch champion data.");
      }
    };

    fetchChampion();
  }, []);


  return (
    <div className="bg-sky-50 dark:bg-zinc-800/50 w-full flex justify-center">
      <div className="flex-1 flex flex-col gap-2 items-center w-full md:max-w-6xl bg-sky-100 dark:bg-zinc-900">
        <div className="relative w-full h-80">
          <Image
            src="/winter.jpg"
            alt="leaders page banner image"
            fill
            className="h-80 w-full object-cover opacity-90 shadow-md"
            priority
          />
          <div className=" absolute bottom-1 left-0 my-4 ml-6 flex flex-col gap-1 w-fit">
            <div className="flex font-black text-4xl">
              <h1 className="text-sky-50">QT</h1>
              <h1 className="text-sky-300">24</h1>
            </div>
            <h1 className="font-bold text-3xl text-sky-50 leading-none align-text-bottom">
              Division Winners
            </h1>
          </div>
        </div>
        <div className="animate-in flex flex-col items-center gap-10 opacity-0 w-full px-5">
          <main className="flex-1 flex flex-col gap-6 w-full items-center ">
            <div className="w-full py-4 flex flex-col items-center gap-5">
              <div className="bg-white dark:bg-zinc-800/80 p-4 shadow-md w-full max-w-[600px]">
                <div className="overflow-hidden rounded-md w-full max-w-[600px]">
                  <ChampCard champion={champion}/>
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-800/80 p-4 shadow-md text-sm flex flex-col gap-6 w-full max-w-[600px]">
                {divisionsList.map((division) => (
                    <PodiumCard key={division.division} division={division} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
