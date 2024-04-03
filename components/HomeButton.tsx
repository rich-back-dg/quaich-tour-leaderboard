import Link from "next/link";
import { Button } from "./ui/button";

export default function HomeButton() {
  return (
    <Link href="/" rel="noreferrer">
      <Button variant={"outline"}>Standings</Button>
    </Link>
  );
}
