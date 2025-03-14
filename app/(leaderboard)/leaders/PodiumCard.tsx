"use client";

import { getDivisionTopThree } from "@/db/queries";
import { Division, DivisionTopThree } from "@/lib/types";
import { useState, useEffect } from "react";
import { TrophyIcon, SquareArrowOutUpRight, Medal } from "lucide-react";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";

type Props = {
  division: Division;
};

const pinImages = [
  { url: "/qt-pin-gold.png", size: 'w-7 h-7', color: "ring-gold" },
  { url: "/qt-pin-silver.png", size: 'w-6 h-6', color: "ring-silver" },
  { url: "/qt-pin-bronze.png", size: 'w-5 h-5', color: "ring-bronze" },
];

export default function PodiumCard({ division }: Props) {
  const [divisionTopThree, setDivisionTopThree] = useState<DivisionTopThree[]>(
    []
  );

  useEffect(() => {
    const fetchTopThree = async () => {
      try {
        const topThreeData = await getDivisionTopThree(division.division);
        if (topThreeData) {
          setDivisionTopThree(topThreeData);
        } else {
          toast.error("Failed to fetch division top three.");
        }
      } catch (error) {
        console.error("Error fetching division top three:", error);
        toast.error("Failed to fetch division top three.");
      }
    };

    fetchTopThree();
  }, []);

  return (
    <Card className="relative rounded-none bg-sky-50 dark:bg-zinc-900/50 border-0 overflow-hidden">
      <Image
        src="/qt-logo.webp"
        alt="Quaich Tour Logo"
        width={270}
        height={270}
        className="absolute -bottom-14 -left-24 z-0 opacity-10"
      />
      <CardHeader className="px-3 py-3 z-10 relative">
        <CardTitle>
          <div className="flex justify-center items-center text-white text-xl leading-none font-bold bg-red-400 p-1 rounded-md drop-shadow-md shadow-inner w-fit">
            <h1 className="pt-1">{division.division}</h1>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 z-10 relative">
        <Table className="bg-white dark:bg-zinc-800">
          <TableHeader className="bg-sky-900 hover:bg-sky-900 ">
            <TableRow className="h-12 text-[11px] leading-3 font-bold">
              <TableHead className="text-white dark:text-sky-100 bg-sky-900 w-14">
                <div className="flex items-center justify-center">
                  <Medal
                    size={18}
                    strokeWidth={1}
                    color="white"
                    className="text-center"
                  />
                </div>
              </TableHead>
              <TableHead className="text-white uppercase dark:text-sky-100 bg-sky-900">
                Name
              </TableHead>
              <TableHead className="text-center text-white dark:text-sky-100 bg-sky-900 uppercase">
                Events
              </TableHead>
              <TableHead className="text-center text-white dark:text-sky-100 bg-sky-900 uppercase">
                Avg. Points
              </TableHead>
              <TableHead className="text-center text-white dark:text-sky-100 bg-sky-900 uppercase">
                Points
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {divisionTopThree.map((player) => (
              <TableRow
                key={player.name}
                className="first:text-[14px] text-[13px] first:font-semibold h-12 border-b-0 dark:border-b-zinc-600"
              >
                <TableCell className="w-">
                  <Image
                    src={pinImages[player.rank - 1].url}
                    alt="qt pin icon"
                    width={420}
                    height={420}
                    className={`${pinImages[player.rank - 1].size} mx-auto ring-2 ${
                      pinImages[player.rank - 1].color
                    } rounded-full`}
                  />
                </TableCell>
                <TableCell className="">{player.name}</TableCell>
                <TableCell className="text-center">
                  {player.events_played}
                </TableCell>
                <TableCell className="text-center">
                  {player.points_average}
                </TableCell>
                <TableCell className="text-center">
                  {player.total_tour_points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-end">
        <Link
          href={`/?division=${division.division}`}
          className="flex gap-1 justify-center items-center"
        >
          <p className="text-sky-900 dark:text-sky-100">
            Full Division Results{" "}
          </p>
          <SquareArrowOutUpRight size={13} />
        </Link>
      </CardFooter>
    </Card>
  );
}
