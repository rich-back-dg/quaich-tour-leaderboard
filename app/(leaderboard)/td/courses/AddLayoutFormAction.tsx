"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { LayoutSchema } from "@/lib/types";

export async function addLayout(newLayout: unknown) {

  const result = LayoutSchema.safeParse(newLayout);
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
    .from("layouts")
    .insert({ layout_name: result.data.layout_name, hole_pars: result.data.holePars, course_id: result.data.course_id })
    .select();

  if (error) {
    console.log("Could not add Layout: ", error);
    redirect("/td");
  }
  console.log(data);

  revalidatePath("/td")
  redirect('/td')
}
