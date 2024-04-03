import { createClient } from "@/utils/supabase/server";
import React from "react";
import AddLayoutForm from "../AddLayoutForm";
import UpdateCourseForm from "../UpdateCourseForm";

export const dynamicParams = true;

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();

  const { data: course } = await supabase
    .from("courses")
    .select()
    .eq("course_id", params.id)
    .single();

  return {
    title: `Course Manager | ${course?.course_name || "Course not found"}`,
  };
}

async function getCourse(id: string) {
  const supabase = createClient();

  const { data } = await supabase
    .from("courses")
    .select()
    .eq("course_id", id)
    .single();

  return data;
}

export default async function CourseDetails({ params }: Props) {
  const course = await getCourse(params.id);

  return (
    <div className="h-full flex-1 flex flex-col gap-20">
      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <main className="flex flex-col gap-6 bg-gray-200 max-h-min p-5 shadow-sm mt-10">
          <div className="mt-5">
            <h1 className="uppercase font-bold text-center">
              {course.course_name}
            </h1>
          </div>
          <div className="bg-gray-100 p-20 shadow-md">
            <AddLayoutForm courseId={course.course_id} />
            <UpdateCourseForm courseId={course.course_id} />
          </div>
        </main>
      </div>
    </div>
  );
}
