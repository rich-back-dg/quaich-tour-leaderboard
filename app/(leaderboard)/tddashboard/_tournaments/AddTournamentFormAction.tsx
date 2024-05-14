"use server";

import { TournamentFormSchema } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const supabase = createClient();

export async function addTournament(newTournament: unknown) {
  const result = TournamentFormSchema.safeParse(newTournament);
  if (!result.success) {
    let errorMessage = "";

    result.error.issues.forEach((issue) => {
      errorMessage = errorMessage + issue.path[0] + ": " + issue.message + ". ";
    });

    return {
      error: errorMessage,
    };
  }

  const { data, error } = await supabase
    .from("tournaments")
    .insert([
      {
        tournament_name: result.data.tournamentName,
        date: result.data.date,
        isMajor: result.data.isMajor,
        course_id: result.data.course_id,
      },
    ])
    .select();

  if (error) {
    console.log(error.message);
    redirect("/td/schedule");
  }

  revalidatePath("/td/schedule");
  redirect("/td/schedule");
}
