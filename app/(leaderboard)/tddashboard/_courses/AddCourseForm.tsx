"use client";

import { CourseSchema } from "@/lib/types";
import { SubmitButton } from "../../../../components/submit-button";
import { addCourse } from "./AddCourseFormAction";
import toast from "react-hot-toast";

export default function AddCourseForm() {

  const clientAction = async (formData: FormData) => {

    const courseName = formData.get("course_name") as string;

    const newCourse = {
      course_name: courseName
    }

    const result = CourseSchema.safeParse(newCourse);
    if(!result.success) {
      let errorMessage = "";

      result.error.issues.forEach((issue) => { 
        errorMessage = 
          errorMessage + issue.path[0] + ": " + issue.message + ". ";
       });
       toast.error(errorMessage)
       return;
    }

    const response = await addCourse(newCourse);
    toast.success("New course successfully added")
    if (response?.error) {
      toast.error(response.error)
    }
    
  }
  return (
    <div>
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <label htmlFor="course_name">Course Name</label>
        <input
          name="course_name"
          type="text"
          required
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
        />
        <SubmitButton
          formAction={clientAction}
          className="bg-green-700 rounded-md px-4 py-2 text-foreground text-white mb-2"
          pendingText="Adding course..."
        >
          Add Course
        </SubmitButton>
      </form>
    </div>
  );
}
