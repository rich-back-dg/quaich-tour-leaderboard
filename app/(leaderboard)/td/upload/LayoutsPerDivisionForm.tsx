import { Label } from "@/components/ui/label";
import { EventRounds, Layout } from "@/lib/types";
import React, { SetStateAction } from "react";

interface Props {
  divisions: string[];
  numberOfRounds: number;
  layouts: Layout[];
  layoutsPerDivision: EventRounds[];
  setLayoutsPerDivision: React.Dispatch<SetStateAction<EventRounds[]>>;
}

export default function LayoutsPerDivisionForm({
  divisions,
  numberOfRounds,
  layouts,
  layoutsPerDivision,
  setLayoutsPerDivision,
}: Props) {
  const handleLayoutSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const layoutSelected = e.target.value;
    const division = e.target.id;
    const roundNumber = e.target.name;

    // Find if the division already exists in layoutsPerDivision
    const divisionIndex = layoutsPerDivision.findIndex(
      (eventRound) => eventRound.division === division
    );

    // If the division already exists, update its corresponding round
    if (divisionIndex !== -1) {
      const updatedLayoutsPerDivision = [...layoutsPerDivision];
      updatedLayoutsPerDivision[divisionIndex].rounds.push({
        round: roundNumber,
        layout: layoutSelected,
      });
      setLayoutsPerDivision(updatedLayoutsPerDivision);
    } else {
      // If the division doesn't exist, create a new EventRounds object
      setLayoutsPerDivision((prevLayoutsPerDivision) => [
        ...prevLayoutsPerDivision,
        {
          division,
          rounds: [{ round: roundNumber, layout: layoutSelected }],
        },
      ]);
    }
  };

  return (
    <div className="w-full min-w-fit flex flex-col items-center">
      <Label>Please select the layouts each Division played</Label>
      <div className="mt-5 space-y-1">
        {divisions?.map((division, index) => (
          <div
            key={index}
            className="grid gap-3 py-1 grid-flow-col auto-cols-auto"
          >
            <div className="border flex justify-center items-center w-16 rounded-md bg-slate-100 text-slate-700">
              <p>{division}</p>
            </div>
            {Array.from({ length: numberOfRounds }).map((_, roundIndex) => (
              <div key={roundIndex} className="">
                <select
                  className="rounded-md px-4 py-[7px] border"
                  onChange={(e) => handleLayoutSelect(e)}
                  name={(roundIndex + 1).toString()}
                  id={division}
                >
                  <option value="">Round {roundIndex + 1}</option>

                  {layouts.map((layout, index) => (
                    <option key={index} value={layout.layout_name}>
                      {layout.layout_name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

