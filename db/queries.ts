"use server";

import { createClient } from "../utils/supabase/server";
import { Course, Division, DivisionTopThree, DivisionWinner, LeaderboardResults, Player, PlayerResult, Tournament } from "@/lib/types";
import { Layout } from "@/lib/types";

const supabase = createClient();

export async function getCourses(): Promise<Course[] | null> {
  try {
    const { data: courses, error } = await supabase.from("courses").select("*");

    if (error) {
      throw new Error(`Could not fetch courses data: ${error.message}`);
    }

    return courses || null; // Return null if courses is undefined
  } catch (error) {
    console.error("Error fetching courses:", error);
    return null;
  }
}

export async function getLayoutsForCourse(
  courseId: string
): Promise<Layout[] | null> {
  try {
    const { data: layouts, error } = await supabase
      .from("layouts")
      .select("*")
      .eq("course_id", courseId);

    if (error) {
      throw new Error(`Could not fetch layouts data: ${error.message}`);
    }

    return layouts || null;
  } catch (error) {
    console.error("Error fetching layouts: ", error);
    return null;
  }
}

export async function getDivisionWinnersForTournament(
  tournament_id_to_search: string
): Promise<DivisionWinner[] | null> {
  try {
    const { data, error } = await supabase
    .rpc('get_first_place_players', {
      tournament_id_to_search
    })
    if (error) {
      throw new Error(`Could not fetch division winners data: ${error.message}`);
    }

    return data || null;
  } catch (error) {
    console.error("Error fetching division winners: ", error);
    return null;
  }
}

export async function getDivisionTopThree(
  p_division: string
): Promise<DivisionTopThree[] | null> {
  try {
    const { data, error } = await supabase
    .rpc('get_top_players_by_division', {
      p_division
    })
    if (error) {
      throw new Error(`Could not fetch division top 3 data: ${error.message}`);
    }
    
    return data || null;
  } catch (error) {
    console.error("Error fetching division top 3: ", error);
    return null;
  }
}

export async function getTournaments(): Promise<Tournament[] | null> {
  try {
    const { data: tournaments_data, error } = await supabase
      .from("tournaments")
      .select(`*, courses (course_name)`)
      .order("date", { ascending: true });

    if (error) {
      throw new Error(`Could not fetch Tournaments data: ${error.message}`);
    }
    return tournaments_data || null;
  } catch (error) {
    console.error("Error fetching Tournaments: ", error);
    return null;
  }
}

export async function getResults(): Promise<PlayerResult[] | null> {
  try {
    const { data: results_data, error } = await supabase
      .from("results")
      .select("*")

    if (error) {
      throw new Error(`Could not fetch Results data: ${error.message}`);
    }
    return results_data || null;
  } catch (error) {
    console.error("Error fetching Results: ", error);
    return null;
  }
}

export async function getPlayers(): Promise<Player[] | null> {
  try {
    const { data: players_data, error } = await supabase
      .from("players")
      .select()
      .order("first_name", { ascending: true });

    if (error) {
      throw new Error(`Could not fetch Players data: ${error.message}`);
    }
    return players_data || null;
  } catch (error) {
    console.error("Error fetching Players List: ", error);
    return null;
  }
}

export async function getLeaderboardData(): Promise<LeaderboardResults[] | null> {

  try {
    const { data: leaderboard_data, error } = await supabase
      .from("tour_leaderboard_view")
      .select();
  
    if (error) {
      console.error("Could not fetch leaderboard data: ", error.message);
    }
  
    return leaderboard_data ?? [];
    
  } catch (error) {
    console.error("Error fetching Leaderboard Data: ", error)
    return null;
  }
}

export async function getChampionData(): Promise<LeaderboardResults | null> {

  try {
    const { data: championData, error } = await supabase
      .from("tour_leaderboard_view")
      .select()
      .eq("rank", 1)
      .single()
  
    if (error) {
      console.error("Could not fetch champion data: ", error.message);
    }
  
    return championData ?? {};
    
  } catch (error) {
    console.error("Error fetching Champion Data: ", error)
    return null;
  }
}

export async function getDivisionsList(): Promise<Division[] | null> {

  try {
    const { data: divisions, error } = await supabase
      .from("divisions_list")
      .select();
  
    if (error) {
      console.error("Could not fetch divisions list: ", error.message);
    }
  
    return divisions ?? [];
    
  } catch (error) {
    console.error("Error fetching divisions list: ", error)
    return null;
  }
}
