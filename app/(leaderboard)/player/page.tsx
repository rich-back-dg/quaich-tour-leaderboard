import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PlayerPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

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

  if (!profile || profile.role !== "player") {
    return redirect("/");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <div className="py-6 font-bold bg-purple-950 text-center text-white">
          This is the Player Profile page
        </div>
      </div>

      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6">
          <h2 className="font-bold text-4xl mb-4">
            Welcome, {profile?.first_name}!
          </h2>
        </main>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>Powered by rich-back</p>
      </footer>
    </div>
  );
}
