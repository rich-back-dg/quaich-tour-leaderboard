import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import SignupDialog from "./SignupDialog";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "../../components/submit-button";
import { BackButton } from "@/components/BackButton";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect("/tddashboard");
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center bg-sky-50 dark:bg-zinc-900 p-6 md:p-12">
      <div className="md:hidden absolute top-10 left-10 ">
        <BackButton href={"/"} />
      </div>
      <div className="w-fit md:w-full min-h-fit md:grid md:min-h-full md:grid-cols-2 rounded-xl shadow-xl border bg-zinc-50 dark:bg-zinc-800/20 dark:border-zinc-500">
        <div className="hidden md:block ">
          <Image
            src="/farewell-fanmore.jpeg"
            alt="Fanmore Isle of Mull"
            width="1920"
            height="1080"
            className="h-full w-full object-[75%] object-cover dark:brightness-[0.6] saturate-150 shadow-lg rounded-tl-xl rounded-bl-xl"
            priority
          />
        </div>

        <div className="relative flex flex-col items-center justify-center px-8 py-12 animate-in">
          <div className="absolute top-10 left-10 hidden md:block border rounded-md">
            <BackButton href={"/"} />
          </div>
          <div className="mx-auto grid max-w-1/2 gap-6 ">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">Login</h1>
              <p className="text-balance">
                Enter your email below to login to your account
              </p>
            </div>
            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>

                  {/* TODO: Add password reset functionality */}

                  {/* <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link> */}
                </div>
                <Input id="password" type="password" name="password" required />
              </div>
              <SubmitButton
                formAction={signIn}
                className="h-10 rounded-md px-8 bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
                pendingText="Logging in..."
              >
                Login
              </SubmitButton>
              {searchParams?.message && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>There was a problem</AlertTitle>
                  <AlertDescription>{searchParams.message}</AlertDescription>
                </Alert>
              )}
            </form>
            {/* <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?
            </div>
            <SignupDialog /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
