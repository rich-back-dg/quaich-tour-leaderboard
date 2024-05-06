"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SubmitButton } from "@/components/submit-button";
import { getTournaments } from "@/db/queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tournament } from "@/lib/types";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { DateRange } from "react-day-picker";
import {
  PlusCircledIcon,
  TrashIcon,
  Pencil1Icon,
  Pencil2Icon,
  CrossCircledIcon,
  UpdateIcon,
  CheckIcon,
  CheckboxIcon,
} from "@radix-ui/react-icons";
import DatePickerWithRange from "@/components/DateRangePicker";
import AddTournamentForm from "./AddTournamentForm";

export default function TournamentsList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [rowIndex, setRowIndex] = useState<number | undefined>(undefined);
  const [date, setDate] = useState<DateRange | undefined>();
  const [isMajor, setIsMajor] = useState<boolean>(false);

  const isMajorInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const courseInputRef = useRef<HTMLInputElement>(null);

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

  function handleRowToUpdate(index: number): boolean {
    if (index === rowIndex && isUpdating) {
      return false;
    } else {
      return true;
    }
  }

  const cancelUpdate = () => {
    // Reset form fields to values from the database for the current tournament
    const currentTournament = tournaments[rowIndex];
    // setDate(currentTournament.date);
    setIsMajor(currentTournament.isMajor);
  };

  const updateTournament = (formData: FormData) => {
    const currentTournament = tournaments[rowIndex];

    const updatedDate = date;
    const major = formData.get("isMajor") === null ? false : true;
    const tournamentName = formData.get("name") as string;

    const updatedTournament = {
      ...currentTournament,
      date: updatedDate || currentTournament.date,
      isMajor: major,
      tournament_name: tournamentName,
    };

    console.log(updatedTournament);
  };

  const handleIsMajor = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMajor(e.target.checked);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>
            The tournament schedule for the current season
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 ">
            {tournaments.map((tournament, index) => (
              <div
                key={tournament.id}
                className={
                  isUpdating && rowIndex === index
                    ? "flex justify-evenly"
                    : isUpdating && rowIndex !== index
                    ? "opacity-50 flex justify-evenly"
                    : "flex justify-evenly"
                }
              >
                <form className="grid gap-5 grid-flow-col auto-cols-auto ">
                  <div className="font-semibold flex items-center justify-center">
                    <Label className="sr-only">Date</Label>
                    <DatePickerWithRange
                      date={
                        isUpdating && rowIndex === index
                          ? date
                          : tournament.date
                      }
                      setDate={setDate}
                      disabled={handleRowToUpdate(index)}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <Label htmlFor="isMajor" className="sr-only">
                      Is Major?
                    </Label>

                    <Input
                      className="w-5 h-5 disabled:opacity-100"
                      name="isMajor"
                      ref={isMajorInputRef}
                      type="checkbox"
                      defaultChecked={tournament.isMajor}
                      onChange={handleIsMajor}
                      disabled={handleRowToUpdate(index)}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <Label htmlFor="name" className="sr-only">
                      Tournament Name
                    </Label>
                    <Input
                      name="name"
                      ref={nameInputRef}
                      type="text"
                      defaultValue={tournament.tournament_name}
                      readOnly={handleRowToUpdate(index)}
                    />
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="course" className="sr-only">
                      Tournament Course
                    </Label>
                    <Input
                      name="course"
                      ref={courseInputRef}
                      type="text"
                      defaultValue={tournament.courses.course_name}
                      readOnly={handleRowToUpdate(index)}
                    />
                  </div>
                  {isUpdating && rowIndex === index ? (
                    <>
                      <div className="text-center flex items-center justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsUpdating(!isUpdating);
                            setRowIndex(undefined);
                            cancelUpdate();
                          }}
                        >
                          <CrossCircledIcon className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="text-center flex items-center justify-center">
                        <SubmitButton
                          className="bg-green-700 hover:bg-green-600 text-white p-2 rounded-lg text-sm"
                          formAction={updateTournament}
                        >
                          <CheckIcon className="w-5 h-5" />
                        </SubmitButton>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center flex items-center justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={isUpdating}
                          onClick={(e) => {
                            e.preventDefault();
                            setIsUpdating(!isUpdating);
                            setRowIndex(index);
                          }}
                        >
                          <Pencil2Icon className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="text-center flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          disabled={isUpdating}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t p-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-1 text-base">
                <PlusCircledIcon className="h-4 w-4" />
                Add Tournament
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a Tournament</DialogTitle>
                <DialogDescription>Fill in the fields below</DialogDescription>
              </DialogHeader>
              <AddTournamentForm />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
