import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CourseList from "./CourseList";
import Link from "next/link";

export default async function TDProfilePage() {
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
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <div className="py-6 font-bold bg-purple-950 text-center text-white">
          This is the TD profile page
        </div>
      </div>

      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6">
          <h2 className="font-bold text-4xl mb-4">
            Welcome, {profile?.first_name}!
          </h2>
          <div className="flex gap-4">
            <Link
              href={"/td/courses"}
              className="bg-cyan-100 border rounded-md px-10 py-5 w-44 flex"
            >
              <button>Manage Courses</button>
            </Link>
            <button className="bg-cyan-100 border rounded-md px-10 py-5 w-44">
              Manage Layouts
            </button>
            <Link
              href={"/td/upload"}
              className="bg-cyan-100 border rounded-md px-10 py-5 w-44"
            >
              <button>Upload Tournament Results</button>
            </Link>
          </div>
          <CourseList />
        </main>
      </div>

      <footer className="w-full border-t p-8 flex justify-center text-center text-xs">
        <p>Powered by rich-back</p>
      </footer>
    </div>
  );
}
