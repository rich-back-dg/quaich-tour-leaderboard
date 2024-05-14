"use client";

import { useState } from "react";
import { SubmitButton } from "../../../../components/submit-button";
import { addLayout } from "./AddLayoutFormAction";
import { LayoutSchema, Pars } from "@/lib/types";
import toast from "react-hot-toast";

type Props = {
  courseId: string
}

export default function AddLayoutForm({ courseId }: Props ) {
  const [numberOfHoles, setNumberOfHoles] = useState(0);
  const [pars, setPars] = useState<Pars[]>([]);
  
  const clientAction = async (formData: FormData) => {
    // construct new layout object
    const layoutName = formData.get("layout_name") as string;

    const newLayout = {
      layout_name: layoutName,
      holePars: pars,
      course_id: courseId,
    };

    // client validation
    const result = LayoutSchema.safeParse(newLayout);
    if (!result.success) {
      let errorMessage = "";

      result.error.issues.forEach((issue) => {
        errorMessage =
          errorMessage + issue.path[0] + ": " + issue.message + ". ";
      });
      toast.error(errorMessage)
      return;
    }

    // invoke server action
    const response = await addLayout(newLayout);
    toast.success("New layout successfully added")
    if (response?.error) {
      toast.error(response.error)
    }
  };



  const handleCourseHolesInput = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setNumberOfHoles(parseInt(e.target.value));
  };

  const handlePars = (e: React.ChangeEvent<HTMLInputElement>) => {
    const holeId = e.target.id;
    const parValue = e.target.value;

    // Check if the hole is already in the array
    const existingHoleIndex = pars.findIndex((item) => item.hole === holeId);

    // If the hole is in the array, update its par value
    if (existingHoleIndex !== -1) {
      const updatedHolePars = [...pars];
      updatedHolePars[existingHoleIndex].par = parValue;
      setPars(updatedHolePars);
    } else {
      // If the hole is not in the array, add it
      setPars((prevHolePars) => [
        ...prevHolePars,
        { hole: holeId, par: parValue },
      ]);
    }
  };

  return (
    <div>
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-3 text-foreground">
        <label htmlFor="layout_name">Layout Name</label>
        <input
          type="text"
          name="layout_name"
          placeholder="e.g. Red Course"
          required
          className="rounded-md px-4 py-2 border mb-6"
        />

        <label htmlFor="numberOfHoles">Select number of holes: </label>
        <select
          id="numberOfHoles"
          className="py-2 w-1/3 text-center"
          onChange={(e) => handleCourseHolesInput(e)}
        >
          <option value="" className="text-center">
            -
          </option>
          {Array.from({ length: 25 }).map((_, index) => (
            <option key={index} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>

        <div className="grid grid-rows-9 grid-flow-col justify-items-center">
          {Array.from({ length: numberOfHoles }).map((_, index) => (
            <div key={index} className="p-1 space-x-2">
              <label htmlFor={"holePar-" + (index + 1)}>
                Hole {index + 1}:
              </label>
              <input
                type="number"
                name="holePars"
                id={"hole" + (index + 1)}
                min={3}
                max={5}
                placeholder="-"
                className="pl-2"
                onChange={(e) => handlePars(e)}
              />
            </div>
          ))}
        </div>

        <SubmitButton
          formAction={clientAction}
          className="bg-green-700 rounded-md px-4 py-2 text-foreground text-white mb-2"
          pendingText="Adding Layout..."
        >
          Add Layout
        </SubmitButton>
      </form>
    </div>
  );
}
