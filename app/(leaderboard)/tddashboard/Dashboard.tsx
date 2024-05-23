"use client";

import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { TableIcon, Users, Calendar, Menu } from "lucide-react";
import React, { useEffect, useState } from "react";
import { columns } from "./columns";
import TournamentsList from "./_tournaments/TournamentsList";
import UploadResultsForm from "./_upload/UploadResultsForm";
import { PlayersDataTable } from "./PlayersDataTable";
import { getPlayers } from "@/db/queries";
import { Player } from "@/lib/types";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CourseList from "./_courses/CourseList";
import AddCourseForm from "./_courses/AddCourseForm";
import AddLayoutForm from "./_courses/AddLayoutForm";

export default function Dashboard() {
  const [idSelected, setIdSelected] = useState("upload");
  const [sheetOpenState, setSheetOpenState] = useState(false)
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersData = await getPlayers();
        if (playersData) {
          setPlayers(playersData);
        } else {
          toast.error("Failed to fetch players list.");
        }
      } catch (error) {
        console.error("Error fetching players list:", error);
        toast.error("Failed to fetch players list.");
      }
    };

    fetchPlayers();
  }, [idSelected === "players"]);

  function handleSheetItemSelect(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    setIdSelected(e.target.id)
    setSheetOpenState(false)
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] bg-zinc-100">
      {/* // DESKTOP SIDEBAR */}
      <div className="hidden border-r bg-zinc-100 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4"></div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium">
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:font-semibold hover:bg-zinc-200/50"
                onClick={() => setIdSelected("upload")}
              >
                <TableIcon className="h-4 w-4" />
                Upload Results
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:font-semibold hover:bg-zinc-200/50"
                onClick={() => setIdSelected("players")}
              >
                <Users className="h-4 w-4" />
                Players
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:font-semibold hover:bg-zinc-200/50"
                onClick={() => setIdSelected("tournaments")}
              >
                <Calendar className="h-4 w-4" />
                Tournaments
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:font-semibold hover:bg-zinc-200/50"
                onClick={() => setIdSelected("courses")}
              >
                <Calendar className="h-4 w-4" />
                Courses
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        {/* MOBILE SIDEBAR */}
        <header className="flex h-14 items-center gap-4 border-b px-4">
          <Sheet open={sheetOpenState} >
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
                onClick={() => setSheetOpenState(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium" onClick={(e) => handleSheetItemSelect(e)}>
                <Link
                  href="#"
                  id="upload"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
                  // onClick={(e) => handleSheetItemSelect(e)}
                >
                  <TableIcon className="h-5 w-5" />
                  Upload Results
                </Link>
                <Link
                  href="#"
                  id="players"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
                  // onClick={(e) => handleSheetItemSelect(e)}
                >
                  <Users className="h-5 w-5" />
                  Players
                </Link>
                <Link
                  href="#"
                  id="tournaments"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
                  // onClick={(e) => handleSheetItemSelect(e)}
                >
                  <Calendar className="h-5 w-5" />
                  Tournaments
                </Link>
                <Link
                  href="#"
                  id="courses"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
                  // onClick={(e) => handleSheetItemSelect(e)}
                >
                  <TableIcon className="h-5 w-5" />
                  Courses
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        <main
          id="dash"
          className={
            idSelected === "tournaments"
              ? "flex flex-1 flex-col gap-4 p-6 bg-white"
              : "hidden"
          }
        >
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Tournaments</h1>
          </div>
          <div className="flex items-center justify-center">
            <TournamentsList />
          </div>
        </main>

        <main
          id="orders"
          className={
            idSelected === "upload"
              ? "flex flex-1 flex-col gap-4 p-6 bg-white"
              : "hidden"
          }
        >
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Upload</h1>
          </div>
          <div className="flex items-center justify-center">
            <UploadResultsForm />
          </div>
        </main>

        <main
          id="players"
          className={
            idSelected === "players"
              ? "flex flex-1 flex-col gap-4 p-6 bg-white"
              : "hidden"
          }
        >
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Players List</h1>
          </div>
          <div className="flex items-center justify-center ">
            <PlayersDataTable data={players} columns={columns} />
          </div>
        </main>

        <main
          id="players"
          className={
            idSelected === "courses"
              ? "flex flex-1 flex-col gap-4 p-6 bg-white"
              : "hidden"
          }
        >
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Course List</h1>
          </div>
          <div className="flex gap-20 items-center justify-evenly border rounded-md py-4">
            <CourseList />
            <AddCourseForm />
          </div>
        </main>
      </div>
    </div>
  );
}
