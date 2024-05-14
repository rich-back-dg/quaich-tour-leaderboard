"use client";

import { CourseSchema } from "@/lib/types";
import { SubmitButton } from "../../../../components/submit-button";
import toast from "react-hot-toast";
import { updateCourse } from "./UpdateCourseFormAction";

type Props = {
  courseId: string
}

export default function UpdateCourseForm({ courseId }: Props ) {

  const clientAction = async (formData: FormData) => {

    const courseName = formData.get("course_name") as string;

    const updatedCourse = {
      course_name: courseName,
      course_id: courseId,
    }

    const result = CourseSchema.safeParse(updatedCourse);
    if(!result.success) {
      let errorMessage = "";

      result.error.issues.forEach((issue) => { 
        errorMessage = 
          errorMessage + issue.path[0] + ": " + issue.message + ". ";
       });
       toast.error(errorMessage)
       return;
    }

    const response = await updateCourse(updatedCourse);
    toast.success("Course successfully updated")
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
          className="rounded-md px-4 py-2 border mb-6"
        />
        <SubmitButton
          formAction={clientAction}
          className="bg-green-700 rounded-md px-4 py-2 text-foreground text-white mb-2"
          pendingText="Adding course..."
        >
          Update Course
        </SubmitButton>
      </form>
    </div>
  );
}
