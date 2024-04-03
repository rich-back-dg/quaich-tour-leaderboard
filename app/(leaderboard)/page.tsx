import { createClient } from "@/utils/supabase/server";

const supabase = createClient();

async function getLeaderboardData() {
  const { data: leaderboard_data, error } = await supabase.from("tour_leaderboard").select();
  const { data: results } = await supabase.from("results").select();


  if (error) {
    console.error("Could not fetch leaderboard data: ", error.message);
  }

  console.table(leaderboard_data);
  console.log([results])
}

export default async function Index() {
  const results = await getLeaderboardData();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6">
          <h2 className="font-bold text-4xl my-4">LEADERBOARD</h2>
        </main>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>Powered by rich-back</p>
      </footer>
    </div>
  );
}
