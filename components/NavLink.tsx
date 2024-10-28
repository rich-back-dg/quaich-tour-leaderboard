"use client";

import Link from "next/link";
import { ComponentProps } from "react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Props = ComponentProps<"button"> & {
  href: string;
  title: string;
};

export default function NavLink({ href, title }: Props) {
  const pathname = usePathname(); // Get current route
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Effect to move the underline to the active link
  useEffect(() => {
    if (pathname === href && linkRef.current) {
      const underline = document.getElementById("underline");
      if (underline && linkRef.current) {
        const { offsetLeft, offsetWidth } = linkRef.current; // Get the current link's position and width
        underline.style.width = `${offsetWidth}px`;
        underline.style.transform = `translateX(${offsetLeft}px)`;
      }
    }
  }, [pathname, href]); // Trigger whenever the route changes

  return (
    <Link
      href={href}
      ref={linkRef}
      rel="noreferrer"
      className={
        pathname === href
          ? "text-zinc-100 text-base font-medium py-[14px] px-2"
          : "text-zinc-400 text-base font-medium py-[14px] px-2"
      }
    >
      {title}
    </Link>
  );
}
