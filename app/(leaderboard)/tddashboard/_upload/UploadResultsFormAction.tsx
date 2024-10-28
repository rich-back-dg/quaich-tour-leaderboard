"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Player, uploadFormSchema } from "@/lib/types";
import { playerChecker } from "@/lib/utils";

const supabase = createClient();

export interface PlayerData {
  Total: string;
  FirstName: string;
  LastName: string;
  PDGANum: string;
  Prize: string;
  Division: string;
  Place: string;
  overall_placing: number;
  event_points: number;
  hasNoPDGANum: boolean;
}

interface PlayerUpdate {
  id: string;
  pdga_num: string;
  has_no_pdga_num: boolean;
}

async function upsertTournament(formData: any) {
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

  let tournamentId: string;

  if (tournamentData) {
    tournamentId = tournamentData.id;
  } else {
    console.error(tournamentError);
    return;
  }
  return tournamentId;
}

async function upsertPlayers(jsonData: PlayerData[]) {
  // Fetch all existing players from the database
  const { data: existingPlayers, error: existingPlayersError } = await supabase
    .from("players")
    .select();

  if (existingPlayersError) {
    console.error(existingPlayersError);
    return;
  }

  const newPlayers: PlayerData[] = [];
  const updatePlayers: PlayerUpdate[] = [];
  let allPlayerData = existingPlayers || [];

  if (existingPlayers && existingPlayers.length > 0) {
    // Step 1: Check for existing players where pdga_num matches
    playerChecker(jsonData, existingPlayers, updatePlayers, newPlayers);

    // Insert new players
    const { data: newPlayerData, error: newPlayerError } = await supabase
      .from("players")
      .upsert(
        newPlayers.map((row) => ({
          first_name: row.FirstName,
          last_name: row.LastName,
          pdga_num: row.PDGANum,
          division: row.Division,
          has_no_pdga_num: row.hasNoPDGANum,
        }))
      )
      .select();

    if (newPlayerError) {
      console.error(newPlayerError);
    } else if (newPlayerData) {
      allPlayerData = allPlayerData.concat(newPlayerData);
    }

    // Update existing players with new PDGA numbers
    const updatePromises = updatePlayers.map(async (player) => {
      const { error: updatePlayerError } = await supabase
        .from("players")
        .update({
          pdga_num: player.pdga_num,
          has_no_pdga_num: player.has_no_pdga_num,
        })
        .eq("id", player.id);

      if (updatePlayerError) {
        console.error(`Error updating player ${player.id}:`, updatePlayerError);
      }
    });

    // Wait for all update promises to complete
    await Promise.all(updatePromises);

    // Fetch updated players to ensure accurate allPlayerData
    const updatedPlayerIDs = updatePlayers.map((player) => player.id);
    const { data: updatedPlayers, error: updatedPlayersError } = await supabase
      .from("players")
      .select()
      .in("id", updatedPlayerIDs);

    if (updatedPlayersError) {
      console.error(updatedPlayersError);
    }

    if (updatedPlayers) {
      allPlayerData = allPlayerData.concat(updatedPlayers);
    }
  } else {
    // Insert all players
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .insert(
        jsonData.map((row) => ({
          first_name: row.FirstName,
          last_name: row.LastName,
          pdga_num: row.PDGANum,
          division: row.Division,
          has_no_pdga_num: row.hasNoPDGANum,
        }))
      )
      .select();

    if (playerError) {
      console.error(playerError);
      return;
    }

    if (playerData) {
      allPlayerData = playerData;
    }
  }
  return allPlayerData;
}

async function upsertResults(
  jsonData: PlayerData[],
  allPlayerData: any[],
  tournamentID: string
) {
  const upsertPromises = jsonData.map(async (playerData) => {
    const currentPlayer = allPlayerData.find(
      (player) => player.pdga_num === playerData.PDGANum
    );

    if (!currentPlayer) {
      console.error(`Player with PDGANum ${playerData.PDGANum} not found.`);
      return;
    }

    const { id: currentPlayerID } = currentPlayer;

    const { error: resultsError } = await supabase
      .from("results")
      .upsert([
        {
          tournament_id: tournamentID,
          player_id: currentPlayerID,
          total: playerData.Total,
          prize: playerData.Prize,
          division: playerData.Division,
          division_placing: playerData.Place,
          overall_placing: playerData.overall_placing,
          event_points: playerData.event_points,
        },
      ])
      .select("id");

    if (resultsError) {
      console.error(
        `Error upserting results for player ${playerData.PDGANum}: ${resultsError.message}`
      );
    }
  });

  // Run all upsert operations concurrently
  await Promise.all(upsertPromises);
}

// Function to insert all data
async function insertData(jsonData: PlayerData[], formData: any) {
  try {
    // Step 1: Upsert Tournament and handle failure
    const tournamentId = await upsertTournament(formData);
    if (!tournamentId) {
      throw new Error('Failed to upsert tournament.');
    }

    // Step 2: Upsert Players and handle failure
    const allPlayerData = await upsertPlayers(jsonData);
    if (!allPlayerData || allPlayerData.length === 0) {
      throw new Error('Failed to upsert players.');
    }

    // Step 3: Upsert Results (final step)
    await upsertResults(jsonData, allPlayerData, tournamentId);
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error inserting data:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    // Optionally return or throw the error to inform the caller
  }
}



export async function uploadResults(newUpload: unknown) {
  const result = uploadFormSchema.safeParse(newUpload);
  if (!result.success) {
    let errorMessage = "";

    result.error.issues.forEach((issue) => {
      errorMessage += `${issue.path[0]}: ${issue.message}. `;
    });

    return {
      error: errorMessage,
    };
  }

  const dataToAdd = result.data.fileData;

  console.log(dataToAdd)

  await insertData(dataToAdd, result.data); // Ensure async is awaited

  revalidatePath("/tddashboard");
  redirect("/tddashboard");
}
