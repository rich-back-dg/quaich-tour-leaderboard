"use client";

import EditProfileForm from "@/components/EditProfileForm";
import { getResults, getTournaments } from "@/db/queries";
import { PlayerResult, Tournament } from "@/lib/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ResultsPageCard from "./ResultsPageCard";

export default function ResultsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

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



  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="flex-1 p-5 bg-slate-100 h-full max-w-6xl">
        <h1>Event Results</h1>
        <div className="flex flex-col items-center gap-5">
          {tournaments.map((tournament) => (
            <ResultsPageCard key={tournament.id} tournament={tournament}/>
          ))}
        </div>

      </div>
    </div>
  );
}
