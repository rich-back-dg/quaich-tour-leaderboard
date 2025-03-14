import { User } from "@supabase/supabase-js";
import AdminButton from "./AdminButton";
import AuthButton from "./AuthButton";
import { ModeToggle } from "./ModeToggle";
import UserAvatar from "./UserAvatar";
import NavLink from "./NavLink";
import Image from "next/image";

type Props = {
  user: User | null;
};

export default function Navbar({ user }: Props) {
  return (
    <nav className="w-full flex justify-center border-b border-zinc-50 h-14 bg-sky-900">
      <div className="w-full max-w-6xl flex justify-between items-center px-2 text-sm relative">
        <div className="relative flex items-center gap-3">
          <Image
            src="/qt-logo.webp"
            alt="Quaich Tour Logo"
            width={40}
            height={40}
            className="ring-1 ring-sky-100 rounded-full"
          />
          <div className="relative flex">
            {/* Shared underline for NavLinks */}
            <div
              id="underline"
            ></div>
            <NavLink href="/" title="Leaderboard" />
            <NavLink href="/leaders" title="Winners" />
          </div>
        </div>
        <div className="flex items-center">
          <AuthButton />
          {user && <AdminButton />}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
