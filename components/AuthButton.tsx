import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return user ? (
    <div className="flex items-center gap-4">

      <form action={signOut}>
        <Button variant={"outline"} className="">
          Logout
        </Button>
      </form>
    </div>
  ) : (
    <Link href="/login" className="py-2 px-3 flex rounded-md no-underline">
      <Button>Login</Button>
    </Link>
  );
}
