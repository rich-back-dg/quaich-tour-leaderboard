import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export async function getCoursesForTD() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .eq("td_id", user?.id);

  if (error) {
    console.log("Could not fetch courses data: ", error.message);
  }

  return courses;
}

export default async function CourseList() {
  const courses = await getCoursesForTD();

  return (
  
  <div>
    <h3 className="uppercase font-semibold mb-1">Courses you Manage</h3>
    <hr />
    <ul className="w-fit">
        {courses?.map((course, index) => (
          <Link href={`/td/courses/${course.course_id}`} key={index}>
            <li className="my-2">{course.course_name}</li>
          </Link>
        ))}
    </ul>
  </div>
)}
