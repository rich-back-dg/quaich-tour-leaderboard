"use client";

import { SubmitButton } from "@/components/submit-button";
import { CSVRow, csvToJson } from "@/lib/csvToJson";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { uploadResults } from "./UploadResultsFormAction";
import { Course, EventRounds, Layout, uploadFormSchema } from "@/lib/types";
import { getCourses } from "@/db/queries";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import LayoutsPerDivisionForm from "./LayoutsPerDivisionForm";
import {
  pointsCalculation,
  sortDivisionsByRanking,
  sortGroupedDivisionsByRanking,
} from "@/lib/utils";
import { getLayoutsForCourse } from "@/db/queries";
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
import DatePickerWithRange from "@/components/DateRangePicker";

export default function UploadResultsForm() {
  const [resultsFile, setResultsFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<CSVRow[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [selectedCourseID, setSelectedCourseID] = useState("");
  const [date, setDate] = useState<DateRange | undefined>();
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

  // <<- HANDLER FUNCTIONS ->>

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

  // <<- FILE DATA PROCESSING FUNCTIONS ->>

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

  // Helper function to filter out any DNFs
  function filterOutDNFs(data: CSVRow[]): CSVRow[] {
    const dnfPlayers: CSVRow[] = [];

    data.forEach((row) => {
      const keys = Object.keys(row);
      const hasIncompleteRound = keys.some(
        (key) => key.startsWith("Rd") && row[key] === ""
      );
      const isDNF = row.Total === "999" || row.Total === "888";
      if (hasIncompleteRound || isDNF) {
        dnfPlayers.push(row);
      }
    });

    const filteredData = data.filter((player) => !dnfPlayers.includes(player));
    return filteredData;
  }

  // Helper function to create temp PDGANum for players without one
  function handleEmptyPDGANum(data: CSVRow[]): CSVRow[] {
    const dataToCheck: CSVRow[] = [...data];
    dataToCheck.forEach((player) => {
      if (player.PDGANum === "") {
        const nameToAdd = "@" + player.FirstName + player.LastName;
        player.PDGANum = nameToAdd;
        player.hasNoPDGANum = true
      } else {
        player.hasNoPDGANum = false
      }
    });
    return dataToCheck;
  }

  function calculateOverallPlacingForSingleLayout(data: CSVRow[]): CSVRow[] {
    const sortedData: CSVRow[] = [...data];

    const numericSort = (a: CSVRow, b: CSVRow) =>
      parseFloat(a.Total) - parseFloat(b.Total);
    const sortedNumericData: CSVRow[] = sortedData.sort(numericSort);

    let currentPosition = 1;
    sortedNumericData.forEach((player, index) => {
      if (index > 0 && player.Total !== sortedNumericData[index - 1].Total) {
        currentPosition = index + 1;
      }
      player.overall_placing = currentPosition;
    });

    return sortedNumericData;
  }

  // Helper function for overallPlacingsFromGroups function
  function calculateOverallPlacingForMultipleLayouts(
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
      calculateOverallPlacingForMultipleLayouts(group, startingPosition);
      startingPosition += group.length;
    });

    const flattenedData = data.flat();
    return flattenedData.sort((a, b) => a.overall_placing - b.overall_placing);
  }

  // Helper function to calculate event points
  function calculateTourPoints(data: CSVRow[], isMajor: boolean) {
    return data.map((player) => ({
      ...player,
      event_points: pointsCalculation(
        player.overall_placing,
        isMajor ? 20 : 0,
        data
      ),
    }));
  }

  function processFileData(
    data: CSVRow[],
    isMultipleLayouts: boolean,
    isMajor: boolean
  ) {
    // Filter out DNFs
    const dataWithDNFsFiltered = filterOutDNFs(data);

    // Check PDGA Numbers and populate any empty occurrences
    const dataWithPDGANumsChecked = handleEmptyPDGANum(dataWithDNFsFiltered);

    // Check if divisions didn't all play the same layout and Calculate placings accordingly
    let dataWithOverallPlacings: CSVRow[] = [];
    if (isMultipleLayouts) {
      // Establish Division groupings based on layoutPerDivision
      const divisionGroupings = groupDivisionsByLayouts(layoutsPerDivision);
      // Group the fileData rows by the established groupings
      const resultsDataGroupings = groupResultsByDivision(
        dataWithPDGANumsChecked,
        divisionGroupings
      );
      // Populate the overall placings from the resultsDataGroupings
      dataWithOverallPlacings = overallPlacingsFromGroups(resultsDataGroupings);
    } else {
      // We only need to run the simplified single layout placings calculation
      dataWithOverallPlacings = calculateOverallPlacingForSingleLayout(
        dataWithPDGANumsChecked
      );
    }

    // Sort DNFs to be last in placings
    const dnfPlayers = data.filter(
      (player) => !dataWithDNFsFiltered.includes(player)
    );
    const lastPlacing = dataWithOverallPlacings.length + 1;
    dnfPlayers.forEach((player) => {
      player.overall_placing = lastPlacing;
    });
    dataWithOverallPlacings.push(...dnfPlayers);

    // Calculate tour points
    const dataWithTourPoints = calculateTourPoints(
      dataWithOverallPlacings,
      isMajor
    );

    return dataWithTourPoints;
  }

  const uploadFormClientAction = async (formData: FormData) => {
    const tournamentName = formData.get("tournamentName") as string;
    const isMajor = formData.get("isMajor") === null ? false : true;
    const isMultipleLayouts =
      formData.get("isMultipleLayouts") === null ? false : true;

    const fileDataToUpload = processFileData(
      fileData,
      isMultipleLayouts,
      isMajor
    );

    console.table(fileDataToUpload);

    const newUpload = {
      fileData: fileDataToUpload,
      tournamentName: tournamentName,
      date: date,
      isMajor: isMajor,
      isMultipleLayouts: isMultipleLayouts,
      course_id: selectedCourseID,
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
                <DatePickerWithRange date={date} setDate={setDate} />
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
                    disabled={resultsFile ? false : true}
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
