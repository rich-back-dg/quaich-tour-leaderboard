import Link from "next/link";
import { ComponentProps } from "react";
import { Button } from "./ui/button";

type Props = ComponentProps<"button"> & {
  href: string;
};

export function BackButton({ href }: Props) {
  return (
    <Link
      href={href}
      className="rounded-md no-underline flex items-center group text-sm max-w-fit"
    >
      <Button variant={"secondary"}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </Button>
    </Link>
  );
}
