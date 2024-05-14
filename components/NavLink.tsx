'use client'

import Link from "next/link";
import { ComponentProps } from "react";
import { usePathname } from "next/navigation";

type Props = ComponentProps<"button"> & {
  href: string;
  title: string;
};

export default function NavLink({ href, title }: Props) {
  const pathname = usePathname();

  return (
    <Link href={href} rel="noreferrer" className={pathname === href ? 'text-zinc-100 text-lg border-b-2 border-sky-100 py-3 px-2 ' : 'text-zinc-100 text-lg border-b-2 border-transparent py-3 px-2 hover:bg-sky-800/50'}>
      {title}
    </Link>
  );
}
