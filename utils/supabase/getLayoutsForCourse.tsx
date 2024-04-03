import { Layout } from "@/lib/types";
import { createClient } from "./client";

export async function getLayoutsForCourse(
  courseId: string
): Promise<Layout[] | null> {
  const supabase = createClient();

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
    console.error("Error fetching layout: ", error);
    return null;
  }
}
