import Link from "next/link";
import { Button } from "./ui/button";
import { ComponentProps } from "react";

type Props = ComponentProps<"button"> & {
  href: string;
  title: string;
};

export default function LinkButton({ href, title }: Props) {
  return (
    <Link href={href} rel="noreferrer">
      <Button variant={"outline"}>{title}</Button>
    </Link>
  );
}
