import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/server";

export default async function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Navbar user={user} />
      {children}
    </>
  );
}
