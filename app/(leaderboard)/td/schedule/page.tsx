import React from "react";
import TournamentsList from "./TournamentsList";

export default function TournamentSchedulePage() {
    
  return (
    <div className="w-full min-h-screen">
      <main className="border p-10">
        <h1 className="mb-10 text-2xl font-semibold">Tournament Schedule</h1>
        <TournamentsList />
      </main>
    </div>
  );
}
