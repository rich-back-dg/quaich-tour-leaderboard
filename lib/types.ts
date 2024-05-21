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

export type DivisionRanking = {
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
  course_id: z.string()
});

export const uploadFormSchema = z.object({
  fileData: z.array(
    z.object({
      Division: z.string(),
      FirstName: z.string(),
      Hole: z.string(),
      LastName: z.string(),
      PDGANum: z.string(),
      hasNoPDGANum: z.boolean(),
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
      overall_placing: z.number(),
      event_points: z.number(),
    })
  ),
  tournamentName: z.string(),
  date: z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  }),
  course_id: z.string(),
  isMultipleLayouts: z.boolean(),
  isMajor: z.boolean()
});

export const TournamentFormSchema = z.object({
  tournamentName: z.string(),
  date: z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  }),
  course_id: z.string(),
  isMajor: z.boolean()
}).partial()

export type LeaderboardRow = {
  name: string;
  PDGANum: string;
  rank: number;
  events_played: number;
  total_tour_points: {total: number, best: number};
}

export type LeaderboardResults = {
  player_id: string;
  events_played: number;
  total_tour_points: number;
  player_results: PlayerResult[];
  rank: number;
  name: string;
  first_name: string;
  last_name: string;
  pdga_num: string;
  id: string;
  division: string;
  has_no_pdga_num: boolean;
}

export type Tournament = {
  id: string;
  course_id: number;
  tournament_name: string;
  isMajor: boolean;
  date: {to: Date, from: Date}
  courses: {course_name: string};
}

export type PlayerResult = {
    id: string,
    prize: string,
    total: string,
    division: string,
    created_at: Date,
    is_counted: boolean,
    event_points: number,
    tournament_id: string,
    overall_placing: number,
    division_placing: string,
}

export type Division = {
  division: string;
}

export type Player = {
  id: string;
  first_name: string;
  last_name: string;
  pdga_num: string;
  division: string;
  has_no_pdga_num: boolean;
}
