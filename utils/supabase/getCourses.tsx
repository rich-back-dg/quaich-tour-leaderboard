import { Course } from "@/lib/types";
import { createClient } from "./client";

export async function getCourses(): Promise<Course[] | null> {
  const supabase = createClient();

  try {
    const { data: courses, error } = await supabase
      .from("courses")
      .select("*");

    if (error) {
      throw new Error(`Could not fetch courses data: ${error.message}`);
    }

    return courses || null; // Return null if courses is undefined
  } catch (error) {
    console.error("Error fetching courses:", error);
    return null;
  }
}
