import SignupForm from "@/app/login/SignupForm";
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import Image from "next/image";

type Props = {
  params: { id: string }
}

export default function TDSignupPage({ params, searchParams }: Props & { searchParams: { message: string }}) {

  const signupType = params.id;

  return (
    <div className="p-16 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-yellow-200/40 to-yellow-500/30 min-h-screen flex">
      <div className="w-full lg:grid lg:min-h-[500px] lg:grid-cols-2 xl:min-h-[700px] rounded-xl shadow-xl bg-zinc-100 ">
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
          <SignupForm signupType={signupType} searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}
