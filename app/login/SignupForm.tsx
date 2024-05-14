import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
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
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const signup_code = formData.get("signup_code") as string;
    const supabase = createClient();

    if (signup_code !== process.env.TD_SIGNUP_CODE && signupType === "TD") {
      return redirect(
        `/signup/${signupType}?message=The code you entered is incorrect`
      );
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            signup_code: signup_code,
            first_name: first_name,
            last_name: last_name
          },
        },
      });

      if (error) {
        console.log(error);
        return redirect(
          `/signup/${signupType}?message=Could not authenticate user`
        );
      }
      return redirect(
        `/signup/${signupType}?message=Check email to continue sign in process`
      );
    }
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
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" type="first_name" name="first_name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" type="last_name" name="last_name" />
        </div>
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
            <InputOTP maxLength={5} name="signup_code" required>
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
          <Alert variant="default" className="bg-zinc-200">
            <div className="flex gap-3 justify-center items-center content-center">
              <InfoCircledIcon className="h-5 w-5 text-blue-500" />
              <AlertTitle className="m-0">{searchParams.message}</AlertTitle>
            </div>
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
