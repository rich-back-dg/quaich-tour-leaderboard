"use client";

import DatePickerWithRange from "@/components/DateRangePicker";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCourses } from "@/db/queries";
import { Course, TournamentFormSchema } from "@/lib/types";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import toast from "react-hot-toast";
import { addTournament } from "./AddTournamentFormAction";

export default function AddTournamentForm() {
  const [date, setDate] = useState<DateRange | undefined>();
  const [isMajor, setIsMajor] = useState<boolean>(false);
  const [selectedCourseID, setSelectedCourseID] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getCourses();
        if (coursesData) {
          setCourses(coursesData);
        } else {
          toast.error("Failed to fetch courses.");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to fetch courses.");
      }
    };

    fetchCourses();
  }, []);

  const handleCourseSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const courseSelected = e.target.value;
    setSelectedCourseID(courseSelected);
  };

  const handleIsMajor = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMajor(e.target.checked);
  };

  const addTournamentFormClientAction = async (formData: FormData) => {
    const tournamentName = formData.get("name") as string;
    const isMajor = formData.get("isMajor") === null ? false : true;

    const newTournament = {
        tournamentName: tournamentName,
        date: date,
        course_id: selectedCourseID,
        isMajor: isMajor
    };

    const result = TournamentFormSchema.safeParse(newTournament)
    if (!result.success) {
        let errorMessage = "";
  
        result.error.issues.forEach((issue) => {
          errorMessage =
            errorMessage + issue.path[0] + ": " + issue.message + ". ";
        });
        toast.error(errorMessage);
        return;
      }
    const response = await addTournament(newTournament)
    toast.success("New Tournament successfully added");
    if (response?.error) {
      toast.error(response.error);
    }

  }

  return (
    <form>
      <div className="flex flex-col gap-3">
        <div>
          <Label>Tournament Name:</Label>
          <Input name="name" type="text" />
        </div>
        <div>
          <Label htmlFor="date">Date: </Label>
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Label htmlFor="courseName">Course: </Label>
          <select
            id="courseName"
            className="rounded-md px-4 py-[7px] border"
            onChange={(e) => handleCourseSelect(e)}
          >
            <option value="">Select Course...</option>

            {courses.map((course, index) => (
              <option key={index} value={course.course_id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 items-center ">
          <Label htmlFor="isMajor">Is it a Major?: </Label>
          <Input
            type="checkbox"
            name="isMajor"
            className="w-4"
            checked={isMajor}
            onChange={handleIsMajor}
          />
        </div>
        <div className="flex justify-end">
          <SubmitButton
            formAction={addTournamentFormClientAction}
            className="bg-green-700 rounded-md px-4 py-2 text-foreground text-white w-40 min-w-fit"
            pendingText="Saving..."
          >
            Save
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
