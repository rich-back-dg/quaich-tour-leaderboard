import StandingsTable from "./StandingsTable";

export default async function Index() {

  return (
    <div className="flex-1 flex flex-col gap-20 items-center w-full bg-sky-50">
      <div className="animate-in flex flex-col items-center gap-20 opacity-0 w-full px-5">
        <main className="flex-1 flex flex-col gap-6 w-full items-center ">
          <h2 className="font-bold text-4xl my-4">LEADERBOARD</h2>
          <div className="w-full py-4">
            <StandingsTable />
          </div>
        </main>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>Powered by rich-back</p>
      </footer>
    </div>
  );
}
