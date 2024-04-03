import AddCourseForm from "./AddCourseForm";
import { BackButton } from "@/components/BackButton";

export default function CourseManagementPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-10 items-center min-h-screen pb-10">
      <div className="w-full">
        <div className="py-6 font-bold bg-purple-950 text-center text-white">
          This is the TD Course Management page
        </div>
      </div>
      <div className="w-full flex justify-start px-3">
        <BackButton href={"/td"} />
      </div>
      <div className="bg-gray-100 p-20 shadow-md">
        <AddCourseForm />
      </div>
    </div>
  );
}
