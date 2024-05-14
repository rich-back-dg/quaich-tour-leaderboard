"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { CourseSchema } from "@/lib/types";

export async function updateCourse(updatedCourse: unknown) {

  const result = CourseSchema.safeParse(updatedCourse);
  if (!result.success) {
    let errorMessage = "";

    result.error.issues.forEach((issue) => {
      errorMessage =
        errorMessage + issue.path[0] + ": " + issue.message + ". ";
    });

    return {
      error: errorMessage,
    };
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("courses")
    .update({ course_name: result.data.course_name })
    .eq('course_id', result.data.course_id)
    .select();

  if (error) {
    console.log("Could not update Course: ", error);
    redirect("/td");
  }
  console.log(data);

  revalidatePath("/td")
  redirect('/td')
}
