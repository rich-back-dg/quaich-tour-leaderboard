"use server";

import { createClient } from "../utils/supabase/server";
import { Course, LeaderboardResults, Tournament } from "@/lib/types";
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
