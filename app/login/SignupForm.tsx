import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { SubmitButton } from "../../components/submit-button";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

type Props = {
  signupType: string;
  searchParams: { message: string };
};

export default function SignupForm({ signupType, searchParams }: Props) {
  const signUpTD = async (formData: FormData) => {
    "use server";

    const origin = headers().get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const signup_code = formData.get("signup_code") as string;
    const supabase = createClient();

    if (signup_code !== process.env.TD_SIGNUP_CODE) {
      return redirect(
        `/signup/${signupType}?message=The code you entered is incorrect`
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          signup_code: signup_code,
        },
      },
    });

    if (error) {
      console.log(error);
      return redirect(`/signup/${signupType}?message=Could not authenticate user`);
    }
    console.log(data);
    return redirect(`/signup/${signupType}?message=Check email to continue sign in process`);
  };
  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">{signupType} Sign Up</h1>
        <p className="text-balance text-muted-foreground">
          Fill in the form below to create a new account
        </p>
      </div>
      <form className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input id="password" type="password" name="password" />
        </div>
        {signupType === "TD" && (
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="signup_code">Special Code</Label>
            </div>
            <InputOTP maxLength={6} name="signup_code">
              <InputOTPGroup className="bg-white">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        )}
        {searchParams?.message && (
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>There was a problem</AlertTitle>
            <AlertDescription>{searchParams.message}</AlertDescription>
          </Alert>
        )}
        <SubmitButton
          formAction={signUpTD}
          className="h-10 rounded-md px-8 bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
          pendingText="Signing Up..."
        >
          Sign Up
        </SubmitButton>
      </form>
    </div>
  );
}
