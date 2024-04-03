"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { uploadFormSchema } from "@/lib/types";
import { SafeParseReturnType } from "zod";

const supabase = createClient();

interface PlayerData {
  Total: string;
  FirstName: string;
  LastName: string;
  PDGANum: string;
  overall_placing?: number; // Optional since it will be added by the function
  Prize: string;
  Division: string;
  Place: string;
}

function groupResultsByDivision(data: PlayerData[], groupings: string[][]) {
  let groups: PlayerData[][][] = [];

  groupings.forEach((group, index) => {
    groups[index] = [];
    group.forEach((division) => {
      const matches = data.filter((result) => result.Division === division);
      groups[index] = groups[index].concat(matches);
    });
  });
  return groups;
}

function calculateOverallPlacing(jsonData: PlayerData[]): PlayerData[] {
  const sortedData: PlayerData[] = [...jsonData];

  const numericSort = (a: PlayerData, b: PlayerData) =>
    parseFloat(a.Total) - parseFloat(b.Total);
  const sortedNumericData: PlayerData[] = sortedData.sort(numericSort);

  let currentPosition = 1;
  sortedNumericData.forEach((player, index) => {
    if (index > 0 && player.Total !== sortedNumericData[index - 1].Total) {
      currentPosition = index + 1;
    }
    player.overall_placing = currentPosition;
  });

  return sortedNumericData;
}

function handleEmptyPDGANum(jsonData: PlayerData[]): PlayerData[] {
  const dataToCheck: PlayerData[] = [...jsonData];
  dataToCheck.forEach((player) => {
    if (player.PDGANum === "") {
      const nameToAdd = "@" + player.FirstName + player.LastName;
      player.PDGANum = nameToAdd;
    }
  });
  return dataToCheck;
}

// Helper function to filter out any DNFs
function filterOutDNFs(jsonData: PlayerData[]): PlayerData[] {
  const dataToFilter: PlayerData[] = [...jsonData];
  const filteredData: PlayerData[] = dataToFilter.filter(
    (row) => row.Total !== "999" && row.Total !== "888"
  );

  return filteredData;
}

function processCSVData(jsonData: PlayerData[]): PlayerData[] {
  const dataWithDNFsRemoved = filterOutDNFs(jsonData);
  const jsonDataPDGANumChecked = handleEmptyPDGANum(dataWithDNFsRemoved);
  const jsonDataWithPlacing = calculateOverallPlacing(jsonDataPDGANumChecked);

  return jsonDataWithPlacing;
}

// Function to insert all data
async function insertData(jsonData: PlayerData[], formData: any) {
  // Upsert Tournament
  const { data: tournamentData, error: tournamentError } = await supabase
    .from("tournaments")
    .upsert([
      {
        tournament_name: formData.tournamentName,
        date: formData.date,
        isMajor: formData.isMajor,
        course_id: formData.course_id,
      },
    ])
    .select("tournament_id");

  let tournamentID: string | undefined;

  if (tournamentData) {
    tournamentID = tournamentData[0].tournament_id;
  } else {
    console.error(tournamentError);
  }

  // Fetch all existing players from the database
  const { data: existingPlayers, error: existingPlayersError } = await supabase
    .from("players")
    .select()
    .in(
      "PDGANum",
      jsonData.map((row) => row.PDGANum)
    );

  const newPlayers = jsonData.filter(
    (row) =>
      !existingPlayers?.some(
        (existingPlayer) => existingPlayer.PDGANum === row.PDGANum
      )
  );

  // Insert new players into the database
  const { data: newPlayerData, error: newPlayerError } = await supabase
    .from("players")
    .upsert(
      newPlayers.map((row) => ({
        FirstName: row.FirstName,
        LastName: row.LastName,
        PDGANum: row.PDGANum,
      }))
    )
    .select();

  // Combine existingPlayers and newPlayerData for further processing if needed
  const allPlayerData = existingPlayers?.concat(newPlayerData);

  // Upsert Results for each player
  for (let i = 0; i < jsonData.length; i++) {
    const currentPlayer = allPlayerData?.find(
      (player) => player.PDGANum === jsonData[i].PDGANum
    );
    const currentPlayerID = currentPlayer.player_id;

    const { data, error } = await supabase
      .from("results")
      .upsert([
        {
          tournament_id: tournamentID,
          player_id: currentPlayerID,
          Total: jsonData[i].Total,
          Prize: jsonData[i].Prize,
          Division: jsonData[i].Division,
          division_placing: jsonData[i].Place,
          overall_placing: jsonData[i].overall_placing,
          // event_points: jsonData[i].event_points,
        },
      ])
      .select("result_id");

    if (error) {
      console.log(error.message);
    }
  }
}

export async function uploadResults(newUpload: unknown) {
  const result = uploadFormSchema.safeParse(newUpload);
  if (!result.success) {
    let errorMessage = "";

    result.error.issues.forEach((issue) => {
      errorMessage = errorMessage + issue.path[0] + ": " + issue.message + ". ";
    });

    return {
      error: errorMessage,
    };
  }

  if (result.data.divisionGroupings) {
    console.log(
      groupResultsByDivision(
        result.data.fileData,
        result.data.divisionGroupings
      )
    );
  }

  // const dataToAdd = processCSVData(result.data.fileData)

  // insertData(dataToAdd, result.data)

  // revalidatePath("/td")
  // redirect("/td")
}
