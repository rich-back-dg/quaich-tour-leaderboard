"use client";

import { SubmitButton } from "@/components/submit-button";
import { CSVRow, csvToJson } from "@/lib/csvToJson";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { uploadResults } from "./UploadResultsFormAction";
import { Course, EventRounds, Layout, uploadFormSchema } from "@/lib/types";
import { getCourses } from "@/utils/supabase/getCourses";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LayoutsPerDivisionForm from "./LayoutsPerDivisionForm";
import {
  divisionRankings,
  sortDivisionsByRanking,
  sortGroupedDivisionsByRanking,
} from "@/lib/utils";
import { getLayoutsForCourse } from "@/utils/supabase/getLayoutsForCourse";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UploadResultsForm() {
  const [resultsFile, setResultsFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<CSVRow[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [selectedCourseID, setSelectedCourseID] = useState("");
  const [switchState, setSwitchState] = useState<boolean>(false);
  const [divisionsList, setDivisionsList] = useState<string[]>([]);
  const [numberOfRounds, setNumberOfRounds] = useState<number>(0);
  const [layoutsPerDivision, setLayoutsPerDivision] = useState<EventRounds[]>(
    []
  );

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

  useEffect(() => {
    const convertFile = async () => {
      if (resultsFile) {
        const csvFile = (await resultsFile?.text()) as string;
        const jsonData = csvToJson(csvFile);
        setFileData(jsonData);
      }
    };
    convertFile();
  }, [resultsFile]);

  useEffect(() => {
    const fetchResultsInfo = async () => {
      if (fileData) {
        const divisions = getDivisionsFromFile(fileData);
        const numRounds = getNumRoundsFromFile(fileData);
        setDivisionsList(divisions);
        setNumberOfRounds(numRounds);
      }
    };
    fetchResultsInfo();
  }, [switchState]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      setResultsFile(file);
    }
  };

  const handleCourseSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const courseSelected = e.target.value;
    setSelectedCourseID(courseSelected);
    const layouts = await getLayoutsForCourse(courseSelected);
    if (layouts) {
      setLayouts(layouts);
    }
  };

  const handleSwitchSelect = async (e: boolean) => {
    setSwitchState(e);
  };

  const handleAccordionState = (): string => {
    return switchState ? "open" : "close";
  };

  const getNumRoundsFromFile = (data: CSVRow[]) => {
    let keys: string[] = [];
    data.map((element) => {
      keys = Object.keys(element);
    });
    return keys.filter((key) => key.includes("Rd")).length;
  };

  const getDivisionsFromFile = (data: CSVRow[]): string[] => {
    const divs = data.map((element) => element.Division);
    const uniqueDivs = (arr: string[]): string[] => {
      return arr.filter((item, index) => arr.indexOf(item) === index);
    };
    const divisions = uniqueDivs(divs);
    divisions.sort(sortDivisionsByRanking);
    return divisions;
  };

  const groupDivisionsByLayouts = (data: EventRounds[]): string[][] => {
    // Create a mapping of layouts to divisions
    const layoutsToDivisions: { [layout: string]: string[] } = {};
    data.forEach((eventRound) => {
      const division = eventRound.division;
      const layoutsPlayed = eventRound.rounds
        .map((round) => round.layout)
        .join(",");
      if (!layoutsToDivisions[layoutsPlayed]) {
        layoutsToDivisions[layoutsPlayed] = [];
      }
      layoutsToDivisions[layoutsPlayed].push(division);
    });

    // Group divisions that played the same layouts
    const groupedDivisions: string[][] = Object.values(layoutsToDivisions);
    return groupedDivisions.sort(sortGroupedDivisionsByRanking);
  };

  function groupResultsByDivision(data: CSVRow[], groupings: string[][]) {
    let groups: CSVRow[][] = [];

    groupings.forEach((group, index) => {
      groups[index] = [];
      group.forEach((division) => {
        const matches = data.filter((result) => result.Division === division);
        groups[index] = groups[index].concat(matches);
      });
    });

    return groups;
  }

  function calculateOverallPlacing(
    jsonData: CSVRow[],
    startingPosition: number
  ): CSVRow[] {
    const sortedData: CSVRow[] = [...jsonData];

    const numericSort = (a: CSVRow, b: CSVRow) =>
      parseFloat(a.Total) - parseFloat(b.Total);
    const sortedNumericData: CSVRow[] = sortedData.sort(numericSort);

    let currentPosition = startingPosition;
    sortedNumericData.forEach((player, index) => {
      if (index > 0 && player.Total !== sortedNumericData[index - 1].Total) {
        currentPosition = index + startingPosition;
      }
      player.overall_placing = currentPosition;
    });

    return sortedNumericData;
  }

  function overallPlacingsFromGroups(data: CSVRow[][]) {
    let startingPosition = 1;

    data.forEach((group, index) => {
      calculateOverallPlacing(group, startingPosition);
      startingPosition += group.length;
    });

    const flattenedData = data.flat();
    return flattenedData.sort((a, b) => a.overall_placing - b.overall_placing);
  }

  // Example Usage
  const groupings = [
    ["MPO", "MA1", "MA40"],
    ["FA1", "MA50", "MA2", "MA3"],
    ["FA40", "MJ10", "FA3", "MA4", "MJ12"],
  ];

  const groupedData = groupResultsByDivision(fileData, groupings);
  //   console.table(overallPlacingsFromGroups(groupedData))

  const uploadFormClientAction = async (formData: FormData) => {
    const tournamentName = formData.get("tournamentName") as string;
    const date = formData.get("date");
    const isMajor = formData.get("isMajor") === null ? false : true;
    const isMultipleLayouts =
      formData.get("isMultipleLayouts") === null ? false : true;
    const divisionGroupings = groupDivisionsByLayouts(layoutsPerDivision);

    const newUpload = {
      fileData: fileData,
      tournamentName: tournamentName,
      date: date,
      isMajor: isMajor,
      isMultipleLayouts: isMultipleLayouts,
      course_id: selectedCourseID,
      divisionGroupings: divisionGroupings,
    };

    const result = uploadFormSchema.safeParse(newUpload);
    if (!result.success) {
      let errorMessage = "";

      result.error.issues.forEach((issue) => {
        errorMessage =
          errorMessage + issue.path[0] + ": " + issue.message + ". ";
      });
      toast.error(errorMessage);
      return;
    }
    const response = await uploadResults(newUpload);
    toast.success("New upload successfully sent");
    if (response?.error) {
      toast.error(response.error);
    }
  };

  return (
    <div className="w-10/12 p-2">
      <Card className="p-8 min-w-[400px]">
        <CardHeader></CardHeader>

        <CardContent>
          <form
            id="uploadform"
            className="animate-in flex flex-col justify-center content-center gap-5"
          >
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-2">
                <Label htmlFor="resultsCsvFile">Results CSV: </Label>
                <Input
                  type="file"
                  name="results_file"
                  accept=".csv"
                  onChange={(e) => handleFileInput(e)}
                />
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

              <div className="flex flex-col gap-2">
                <Label htmlFor="tournamentName">Tournament Name: </Label>
                <Input name="tournamentName" type="text" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Date: </Label>
                <Input type="date" name="date" />
              </div>

              <div className="flex gap-3 items-center ">
                <Label htmlFor="isMajor">Is it a Major?: </Label>
                <Input type="checkbox" name="isMajor" className="w-4" />
              </div>

              <div className="flex items-center space-x-4">
                <Label htmlFor="isMultipleLayouts">
                  Did <b>ALL</b> Divisions play the same course layout?
                </Label>
                <div className="flex gap-2 items-center">
                  <p
                    className={switchState ? "text-gray-300" : "font-semibold"}
                  >
                    Yes
                  </p>
                  <Switch
                    name="isMultipleLayouts"
                    onCheckedChange={(e) => handleSwitchSelect(e)}
                  />
                  <p
                    className={!switchState ? "text-gray-300" : "font-semibold"}
                  >
                    No
                  </p>
                </div>
              </div>

              <Accordion
                type="single"
                collapsible
                value={handleAccordionState()}
              >
                <AccordionItem className="border-b-0" value="open">
                  <AccordionContent>
                    <div className="animate-in">
                      <LayoutsPerDivisionForm
                        divisions={divisionsList}
                        numberOfRounds={numberOfRounds}
                        layouts={layouts}
                        layoutsPerDivision={layoutsPerDivision}
                        setLayoutsPerDivision={setLayoutsPerDivision}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="flex justify-end">
              <SubmitButton
                formAction={uploadFormClientAction}
                className="bg-green-700 rounded-md px-4 py-2 text-foreground text-white w-40 min-w-fit"
                pendingText="Uploading Results..."
              >
                Upload
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
