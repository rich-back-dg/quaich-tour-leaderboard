"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { CourseSchema } from "@/lib/types";

export async function addCourse(newCourse: unknown) {

  const result = CourseSchema.safeParse(newCourse);
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
    .insert({ course_name: result.data.course_name })
    .select();

  if (error) {
    console.log("Could not add Course: ", error);
    redirect("/td");
  }
  console.log(data);

  revalidatePath("/td")
  redirect('/td')
}
