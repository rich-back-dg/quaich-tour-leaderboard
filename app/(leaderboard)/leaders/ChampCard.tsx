import { LeaderboardResults } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  champion: LeaderboardResults;
};

export default function ChampCard({ champion }: Props) {
  return (
    <div className="relative h-80 w-full border overflow-hidden aspect-square">
      <Image
        src="/RickRick2.jpeg"
        alt="RickRick"
        priority
        width={100}
        height={100}
        className="max-w-[600px] w-full h-full object-cover object-[100%_15%]"
      />
      <Image
        src="/qt-logo.webp"
        alt="Quaich Tour Logo"
        width={50}
        height={50}
        className="absolute top-2 right-2 opacity-80"
      />
      <div className="w-full h-full absolute bottom-0 p-2">
        <div className="text-sky-50 w-fit bg-black/35 rounded-sm p-1 px-2">
          <div className="flex font-black text-2xl">
            <h1 className="text-sky-50">QT</h1>
            <h1 className="text-sky-300">24</h1>
            <h1 className="text-sky-50 ml-1">Champion</h1>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-xl">{champion.name}</h2>
            <Link
              href={`https://www.pdga.com/player/${champion.pdga_num}`}
              target="_blank"
            >
              <p className="font-light">#{champion.pdga_num}</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 right-3 flex flex-col items-center text-sky-50 bg-sky-800/90 p-1 rounded-sm">
        <div className="font-black text-2xl">{champion.total_tour_points}</div>
        <div className="uppercase text-xs ">points</div>
      </div>
    </div>
  );
}
