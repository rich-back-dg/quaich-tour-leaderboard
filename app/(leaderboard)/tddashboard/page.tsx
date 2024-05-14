import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Dashboard from "./Dashboard";

export default async function TdDashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Retrieve the user's profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error.message);
    return redirect("/login");
  }

  if (!profile || profile.role !== "td") {
    return redirect("/");
  }

  return (
    <>
      <Dashboard />
    </>
  );
}
