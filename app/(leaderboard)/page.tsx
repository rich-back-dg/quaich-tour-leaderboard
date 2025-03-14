"use client";

import Image from "next/image";
import StandingsTable from "./StandingsTable";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Updated import
import { getDivisionsList } from "@/db/queries";
import toast from "react-hot-toast";
import { LucideInfo, Smartphone } from "lucide-react";
import { Division } from "@/lib/types";
import { divisionsSortedByRank } from "@/lib/utils";

export default function Standings() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook to get URL query params in the app directory
  const [divisionsList, setDivisionsList] = useState<Division[]>([]);
  const [selected, setSelected] = useState<string>("Overall");

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const divisions = await getDivisionsList();
        if (divisions) {
          const sortedDivisionList = divisions.sort(divisionsSortedByRank);
          setDivisionsList(sortedDivisionList);

          // Check for the division query parameter
          const divisionFromQuery = searchParams.get("division");
          if (divisionFromQuery) {
            setSelected(divisionFromQuery);
          }
        } else {
          toast.error("Failed to fetch results.");
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Failed to fetch results.");
      }
    };

    fetchDivisions();
  }, [searchParams]); // Trigger useEffect if query parameters change

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedDivision = e.target.value;
    setSelected(selectedDivision);

    // Update the URL to reflect the selected division without reloading the page
    router.push(`?division=${selectedDivision}`);
  }

  return (
    <div className="bg-sky-50 dark:bg-zinc-800/50 w-full flex justify-center">
      <div className="flex-1 flex flex-col gap-2 items-center w-full md:max-w-6xl bg-sky-100 dark:bg-zinc-900">
        <div className="relative w-full h-80">
          <Image
            src="/banner.jpeg"
            alt="banner image"
            fill
            className="h-80 w-full object-cover object-[100%_28%] opacity-90 shadow-md"
            priority
          />
          <div className=" absolute bottom-3 left-0 my-4 ml-6 flex flex-col gap-3 w-fit">
            <h2 className="font-medium text-4xl text-sky-50 leading-none align-text-bottom">
              Leaderboard
            </h2>
            <div>
              <select className="px-3 py-1" onChange={handleSelect} value={selected}>
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
              <div className="bg-white dark:bg-zinc-800/80 p-4 shadow-md text-sm flex flex-col lg:flex-row gap-2">
                <div className="flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-700/30 p-3 rounded-md w-fit md:w-full">
                  <p className="text-zinc-600 dark:text-zinc-100">
                    <LucideInfo
                      strokeWidth={2}
                      className="w-4 h-4 mb-1 text-blue-600 dark:text-blue-300"
                    />
                    Players&apos; overall points for the Quaich Tour will be
                    taken from their best 5 points finishes. Quaich Tour Majors
                    are worth 120% of the points of regular events. Any dropped
                    events will be shown in gray below.
                  </p>
                </div>
                <div className="md:hidden flex items-start justify-center gap-2 bg-zinc-100 dark:bg-zinc-700/30 p-3 rounded-md w-fit lg:w-1/2">
                  <p className="">
                    <Smartphone strokeWidth={2} className="w-4 h-4 mb-1" />
                    <b>Note: </b>When viewing on Mobile devices, try landscape mode to view the full
                    table of results
                  </p>
                </div>
              </div>
              <StandingsTable selected={selected} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
