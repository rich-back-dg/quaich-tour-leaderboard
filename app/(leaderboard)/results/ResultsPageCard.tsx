"use client";

import { getDivisionWinnersForTournament } from "@/db/queries";
import { DivisionWinner, Tournament } from "@/lib/types";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type Props = {
  tournament: Tournament;
};

export default function ResultsPageCard({ tournament }: Props) {
  const [divisionWinners, setDivisionWinners] = useState<DivisionWinner[]>([]);

  console.log(divisionWinners)

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const winnersData = await getDivisionWinnersForTournament(
          tournament.id
        );
        if (winnersData) {
          setDivisionWinners(winnersData);
        } else {
          toast.error("Failed to fetch division winners.");
        }
      } catch (error) {
        console.error("Error fetching division winners:", error);
        toast.error("Failed to fetch division winners.");
      }
    };

    fetchWinners();
  }, []);

  return (
    <div className="w-full h-full p-5 bg-slate-200 rounded-md">
      <h1>{tournament.tournament_name}</h1>
      <ul>
        {divisionWinners?.map((winner) => (
          <li key={winner.division}>
            {winner.first_name} {winner.last_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
