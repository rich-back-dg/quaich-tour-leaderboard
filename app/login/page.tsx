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

    return redirect("/");
  };

  return (
    <div className="p-16 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-yellow-200/40 to-yellow-500/30 min-h-screen flex">
      <div className="w-full lg:grid lg:min-h-[500px] lg:grid-cols-2 xl:min-h-[700px] rounded-xl shadow-xl bg-zinc-50 ">
        <div className="hidden lg:block ">
          <Image
            src="/farewell-fanmore.jpeg"
            alt="Image"
            width="1920"
            height="1080"
            className="h-full w-full object-[75%] object-cover dark:brightness-[0.2] dark:grayscale saturate-150 shadow-lg rounded-tl-xl rounded-bl-xl"
          />
        </div>

        <div className="flex items-center justify-center py-12 animate-in">
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">Login</h1>
              <p className="text-balance text-muted-foreground">
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

                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
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
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?
            </div>
            <SignupDialog />
          </div>
        </div>
      </div>
    </div>
  );
}
