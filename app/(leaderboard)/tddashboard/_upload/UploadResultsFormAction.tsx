"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Player, uploadFormSchema } from "@/lib/types";

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
  hasNoPDGANum: boolean;
}

interface PlayerUpdate {
  id: string;
  pdga_num: string;
  has_no_pdga_num: boolean;
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
    return;
  }

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
  let allPlayerData: any[] = existingPlayers || [];

  if (existingPlayers && existingPlayers.length > 0) {
    console.log("IF STATEMENT RAN");

    // Step 1: Check for existing players where pdga_num matches
    jsonData.forEach((player) => {
      const existingPlayer = existingPlayers.find(
        (existingPlayer: Player) => existingPlayer.pdga_num === player.PDGANum
      );

      if (existingPlayer) {
        // Player already exists with this PDGA number
        return;
      }

      // Step 2: Check for existing players where firstName and lastName match and has_no_pdga_num is true
      const potentialMatch = existingPlayers.find(
        (existingPlayer: Player) =>
          existingPlayer.first_name === player.FirstName &&
          existingPlayer.last_name === player.LastName &&
          existingPlayer.has_no_pdga_num
      );

      if (potentialMatch) {
        // Update existing player with new PDGA number
        updatePlayers.push({
          id: potentialMatch.id!,
          pdga_num: player.PDGANum,
          has_no_pdga_num: false,
        });
      } else {
        // New player
        newPlayers.push(player);
      }
    });

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
        })),
      )
      .select();

    if (newPlayerError) {
      console.error(newPlayerError);
    }

    // Merge new player data if any
    if (newPlayerData) {
      allPlayerData = allPlayerData.concat(newPlayerData);
    }

    // Update existing players with new PDGA numbers
    for (const player of updatePlayers) {
      const { error: updatePlayerError } = await supabase
        .from("players")
        .update({
          pdga_num: player.pdga_num,
          has_no_pdga_num: player.has_no_pdga_num,
        })
        .eq("id", player.id);

      if (updatePlayerError) {
        console.error(updatePlayerError);
      }
    }

    // Fetch updated players to ensure accurate allPlayerData
    const updatedPlayerIDs = updatePlayers.map(player => player.id);
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
    console.log("ELSE STATEMENT RAN");
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

    console.log(playerData);

    if (playerError) {
      console.error(playerError);
      return;
    }

    if (playerData) {
      allPlayerData = playerData;
    }
  }

  // Upsert Results for each player
  for (let i = 0; i < jsonData.length; i++) {
    const currentPlayer = allPlayerData.find(
      (player) => player.pdga_num === jsonData[i].PDGANum
    );

    if (!currentPlayer) {
      console.error(`Player with PDGANum ${jsonData[i].PDGANum} not found.`);
      continue;
    }

    const currentPlayerID = currentPlayer.id;

    const { error: resultsError } = await supabase
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
      errorMessage += `${issue.path[0]}: ${issue.message}. `;
    });

    return {
      error: errorMessage,
    };
  }

  const dataToAdd = result.data.fileData;

  await insertData(dataToAdd, result.data);  // Ensure async is awaited

  revalidatePath("/tddashboard");
  redirect("/tddashboard");
}
