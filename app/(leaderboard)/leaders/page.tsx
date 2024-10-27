"use client";

import { getDivisionsList } from "@/db/queries";
import { Division } from "@/lib/types";
import { divisionsSortedByRank } from "@/lib/utils";
import { LucideInfo } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PodiumCard from "./PodiumCard";

export default function page() {
  const [divisionsList, setDivisionsList] = useState<Division[]>([]);

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


  return (
    <div className="bg-sky-50 dark:bg-zinc-800/50 w-full flex justify-center">
      <div className="flex-1 flex flex-col gap-2 items-center w-full md:max-w-6xl bg-sky-100 dark:bg-zinc-900">
        <div className="relative w-full h-80">
          <Image
            src="/winter.jpg"
            alt="leaders page banner image"
            fill
            className="h-80 w-full object-cover object-[100%_28%] opacity-90 shadow-md"
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
            <div className="w-full py-4 flex flex-col gap-5">
              <div className="bg-white dark:bg-zinc-800/80 p-4 shadow-md text-sm flex flex-col lg:flex-row gap-2">
                <div className="flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-700/30 p-3 rounded-md w-full">
                  <p className="text-zinc-600 dark:text-zinc-100">
                    Image of Rick - QT24 Champ
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-800/80 p-4 shadow-md text-sm flex flex-col gap-6">
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
