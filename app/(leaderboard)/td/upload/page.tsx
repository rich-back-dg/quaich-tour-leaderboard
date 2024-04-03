import { BackButton } from "@/components/BackButton";
import UploadResultsForm from "./UploadResultsForm";

export default function TDUploadPage() {
  return (
    <main className="w-full flex-1 flex flex-col gap-10 items-center min-h-screen pb-10">
      <div className="w-full">
        <div className="py-6 font-bold bg-purple-950 text-center text-white">
          This is the TD Results Upload page
        </div>
      </div>
      <div className="w-full flex justify-start p-3">
        <BackButton href={"/td"} />
      </div>
      <div className="w-full p-5 flex justify-center">
        <UploadResultsForm />
      </div>
    </main>
  );
}
