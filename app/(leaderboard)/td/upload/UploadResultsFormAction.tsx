"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { uploadFormSchema } from "@/lib/types";

const supabase = createClient();

interface PlayerData {
  Total: string;
  FirstName: string;
  LastName: string;
  PDGANum: string;
  Prize: string;
  Division: string;
  Place: string;
  overall_placing: number;
  event_points: number;
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
    .select("id")
    .single();

  let tournamentID: string | undefined;

  if (tournamentData) {
    tournamentID = tournamentData.id;
  } else {
    console.error(tournamentError);
  }

  // Fetch all existing players from the database
  const { data: existingPlayers, error: existingPlayersError } = await supabase
    .from("players")
    .select()
    .in(
      "pdga_num",
      jsonData.map((row) => row.PDGANum)
    );

  const newPlayers = jsonData.filter(
    (row) =>
      !existingPlayers?.some(
        (existingPlayer) => existingPlayer.pdga_num === row.PDGANum
      )
  );

  // Insert new players into the database
  const { data: newPlayerData, error: newPlayerError } = await supabase
    .from("players")
    .upsert(
      newPlayers.map((row) => ({
        first_name: row.FirstName,
        last_name: row.LastName,
        pdga_num: row.PDGANum,
        division: row.Division,
      }))
    )
    .select();

  // Combine existingPlayers and newPlayerData for further processing if needed
  const allPlayerData = existingPlayers?.concat(newPlayerData);

  // Upsert Results for each player
  for (let i = 0; i < jsonData.length; i++) {
    const currentPlayer = allPlayerData?.find(
      (player) => player.pdga_num === jsonData[i].PDGANum
    );
    const currentPlayerID = currentPlayer.id;

    const { data: resultsData, error: resultsError } = await supabase
      .from("results")
      .upsert([
        {
          tournament_id: tournamentID,
          player_id: currentPlayerID,
          total: jsonData[i].Total,
          prize: jsonData[i].Prize,
          division: jsonData[i].Division,
          division_placing: jsonData[i].Place,
          overall_placing: jsonData[i].overall_placing,
          event_points: jsonData[i].event_points,
        },
      ])
      .select("id");

    if (resultsError) {
      console.log(resultsError.message);
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

  const dataToAdd = result.data.fileData;

  insertData(dataToAdd, result.data);

  revalidatePath("/td");
  redirect("/td");
}
