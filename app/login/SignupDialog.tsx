import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

export default function SignupDialog() {

  const urlSlugPlayer = "Player";
  const urlSlugTD = "TD";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="py-5 text-base">Sign Up</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
          <DialogDescription>
            Please select the appropriate Sign Up option below...
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-5 justify-evenly">
          <div className="w-full">
            <DialogClose asChild className="w-full">
              <Link href={`/signup/${urlSlugPlayer}`} className="w-full">
                <Button value="player" className="py-10 w-full">
                  Tour Player
                </Button>
              </Link>
            </DialogClose>
          </div>
          <div className="w-full">
            <DialogClose asChild className="w-full">
              <Link href={`/signup/${urlSlugTD}`} className="w-full">
                <Button value="td" className="py-10 w-full">
                  Tournament Director
                </Button>
              </Link>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
