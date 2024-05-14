'use client'

import { getCourses } from "@/db/queries";
import { Course } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getCourses();
        if (coursesData) {
          setCourses(coursesData);
        } else {
          toast.error("Failed to fetch course list.");
        }
      } catch (error) {
        console.error("Error fetching course list:", error);
        toast.error("Failed to fetch course list.");
      }
    };

    fetchCourses();
  }, []);

  return (
  
  <div>
    <ul className="w-fit">
        {courses?.map((course, index) => (
            <li key={course.course_id} className="my-2">{course.course_name}</li>
        ))}
    </ul>
  </div>
)}
