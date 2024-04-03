import { z } from "zod";

export type Pars = {
  hole: string;
  par: string;
};

export type Course = {
  course_id: number;
  course_name: string;
  td_id: string;
}

export type Layout = {
  layout_id: number;
  layout_name: string;
  course_id: number;
}

export type Division = {
  name: string;
  rank: number;
}

export type EventRounds = {
  division: string;
  rounds: {
    round: string;
    layout: string;
  }[]
}

// export type ResultsFileData = {
//   Division: string,
//   FirstName: string,
//   Hole: string,
//   LastName: string,
//   PDGANum: string,
//   Phone: string,
//   Place: string,
//   Prize: string,
//   Rd1: string,
//   Rd2?: string,
//   Rd3?: string,
//   Rd4?: string,
//   Rd5?: string,
//   Rd6?: string,
//   Start: string,
//   TeeTime: string,
//   Total: string,
// }

export const LayoutSchema = z.object({
  layout_name: z.string(),
  holePars: z.array(
    z.object({
      hole: z.string(),
      par: z.string(),
    })
  ),
  course_id: z.number(),
});

export const CourseSchema = z.object({
  course_name: z.string(),
  course_id: z.number(),
});

export const uploadFormSchema = z.object({
  fileData: z.array(
    z.object({
      Division: z.string(),
      FirstName: z.string(),
      Hole: z.string(),
      LastName: z.string(),
      PDGANum: z.string(),
      Phone: z.string(),
      Place: z.string(),
      Prize: z.string(),
      Rd1: z.string(),
      Rd2: z.string(),
      Rd3: z.string().optional(),
      Rd4: z.string().optional(),
      Rd5: z.string().optional(),
      Rd6: z.string().optional(),
      Rd7: z.string().optional(),
      Rd8: z.string().optional(),
      Start: z.string(),
      TeeTime: z.string(),
      Total: z.string(),
    })
  ),
  tournamentName: z.string(),
  date: z.coerce.date(),
  isMajor: z.boolean(),
  course_id: z.string(),
  isMultipleLayouts: z.boolean(),
  divisionGroupings: z.array(
    z.array(z.string())
  ).optional()
});
