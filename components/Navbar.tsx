import { User } from "@supabase/supabase-js";
import AdminButton from "./AdminButton";
import AuthButton from "./AuthButton";
import HomeButton from "./HomeButton";
import { ModeToggle } from "./ModeToggle";

type Props = {
    user: User | null;
}

export default function Navbar({user}: Props) {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
        <HomeButton />
        <div className="flex justify-between items-center p-3 text-sm gap-5">
          <AuthButton />
          {user && <AdminButton />}
          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}
