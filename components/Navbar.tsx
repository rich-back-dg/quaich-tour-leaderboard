import { User } from "@supabase/supabase-js";
import AdminButton from "./AdminButton";
import AuthButton from "./AuthButton";
import { ModeToggle } from "./ModeToggle";
import UserAvatar from "./UserAvatar";
import LinkButton from "./LinkButton";

type Props = {
  user: User | null;
};

export default function Navbar({ user }: Props) {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-6xl flex justify-between items-center p-3 text-sm">
        <div className="flex justify-between items-center p-3 text-sm gap-5">
          <LinkButton href="/" title="Standings"/>
          <LinkButton href="/results" title="Results"/>
        </div>
        <div className="flex justify-between items-center p-3 text-sm gap-5">
          <AuthButton />
          {user && <AdminButton />}
          <ModeToggle />
          {user && <UserAvatar />}
        </div>
      </div>
    </nav>
  );
}
