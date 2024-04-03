import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";

export default async function AdminButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Retrieve the user's profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error.message);
    return redirect("/");
  }

  return (
    profile && (
      <Link
        href={profile.role === "td" ? "/td" : "/protected"}
        rel="noreferrer"
      >
        <Button>Admin</Button>
      </Link>
    )
  );
}
