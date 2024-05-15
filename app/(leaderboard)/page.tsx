"use client";

import Image from "next/image";
import StandingsTable from "./StandingsTable";
import { useEffect, useState } from "react";
import { getDivisionsList } from "@/db/queries";
import toast from "react-hot-toast";
import { LucideInfo } from "lucide-react";
import { Division } from "@/lib/types";
import { divisionsSortedByRank } from "@/lib/utils";

export default function Standings() {
  const [divisionsList, setDivisionsList] = useState<Division[]>([]);
  const [selected, setSelected] = useState<string>("Overall");

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

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelected(e.target.value);
  }

  return (
    <div className="bg-sky-50 w-full flex justify-center">
      <div className="flex-1 flex flex-col gap-10 items-center max-w-6xl bg-sky-100">
        <div className="relative w-full h-80">
          <Image
            src="/banner.jpeg"
            alt="banner image"
            fill
            className="h-80 w-full object-cover object-[100%_28%] opacity-90 shadow-md"
            priority
          />
          <div className=" absolute bottom-3 left-0 my-4 ml-6 flex flex-col gap-3 w-fit">
            <h2 className="font-medium text-4xl text-white">Leaderboard</h2>
            <div>
              <select className="px-3 py-1" onChange={(e) => handleSelect(e)}>
                <option value="Overall">Overall</option>
                {divisionsList.map((division, index) => (
                  <option key={index} value={division.division}>
                    {division.division}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="animate-in flex flex-col items-center gap-20 opacity-0 w-full px-5">
          <main className="flex-1 flex flex-col gap-6 w-full items-center ">
            <div className="w-full py-4 flex flex-col gap-5">
              <div className="bg-white p-4 shadow-md text-sm">
                <LucideInfo
                  strokeWidth={2}
                  className="w-4 h-4 mb-3 text-blue-600"
                />
                <p className="text-zinc-600">
                  Players&apos; overall points for the Quaich Tour will be taken
                  from their best 5 points finishes. Quaich Tour Majors are
                  worth 120% of the points of regular events. Any dropped events
                  will be shown in gray below.
                </p>
              </div>
              <StandingsTable selected={selected} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
