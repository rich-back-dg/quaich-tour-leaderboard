import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Division, DivisionRanking } from "./types";
import { CSVRow } from "./csvToJson";
import { PlayerData } from "@/app/(leaderboard)/tddashboard/_upload/UploadResultsFormAction";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const divisionRankings: DivisionRanking[] = [
  { name: "MPO", rank: 1 },
  { name: "MP40", rank: 2 },
  { name: "MP50", rank: 3 },
  { name: "MP55", rank: 4 },
  { name: "MP60", rank: 5 },
  { name: "MP65", rank: 6 },
  { name: "MP70", rank: 7 },
  { name: "MP75", rank: 8 },
  { name: "MP80", rank: 9 },
  { name: "FPO", rank: 10 },
  { name: "FP40", rank: 11 },
  { name: "FP50", rank: 12 },
  { name: "FP55", rank: 13 },
  { name: "FP60", rank: 14 },
  { name: "FP65", rank: 15 },
  { name: "FP70", rank: 16 },
  { name: "FP75", rank: 17 },
  { name: "FP80", rank: 18 },
  { name: "MA1", rank: 19 },
  { name: "FA1", rank: 20 },
  { name: "MA40", rank: 21 },
  { name: "FA40", rank: 22 },
  { name: "MA50", rank: 39 },
  { name: "FA50", rank: 42 },
  { name: "MA55", rank: 25 },
  { name: "FA55", rank: 26 },
  { name: "MA60", rank: 27 },
  { name: "FA60", rank: 28 },
  { name: "MA65", rank: 29 },
  { name: "FA65", rank: 30 },
  { name: "MA70", rank: 31 },
  { name: "FA70", rank: 32 },
  { name: "MA75", rank: 33 },
  { name: "FA75", rank: 34 },
  { name: "MA80", rank: 35 },
  { name: "FA80", rank: 36 },
  { name: "MA2", rank: 37 },
  { name: "FA2", rank: 38 },
  { name: "MA3", rank: 39 },
  { name: "FA3", rank: 40 },
  { name: "MA4", rank: 41 },
  { name: "FA4", rank: 42 },
  { name: "MJ18", rank: 43 },
  { name: "FJ18", rank: 44 },
  { name: "MJ15", rank: 45 },
  { name: "FJ15", rank: 46 },
  { name: "MJ12", rank: 47 },
  { name: "FJ12", rank: 48 },
  { name: "MJ10", rank: 49 },
  { name: "FJ10", rank: 50 },
  { name: "MJ08", rank: 51 },
  { name: "FJ08", rank: 52 },
  { name: "MJ06", rank: 53 },
  { name: "FJ06", rank: 54 },
];

// Custom sorting function based on division rankings
export const sortGroupedDivisionsByRanking = (
  a: string[],
  b: string[]
): number => {
  // Find the ranks of the first division in each group
  const rankA =
    divisionRankings.find((division) => division.name === a[0])?.rank || 0;
  const rankB =
    divisionRankings.find((division) => division.name === b[0])?.rank || 0;

  // Compare ranks and return the result
  return rankA - rankB;
};

// Custom sorting function based on division rankings
export const sortDivisionsByRanking = (a: string, b: string): number => {
  // Find the ranks of the first division in each group
  const rankA =
    divisionRankings.find((division) => division.name === a)?.rank || 0;
  const rankB =
    divisionRankings.find((division) => division.name === b)?.rank || 0;

  // Compare ranks and return the result
  return rankA - rankB;
};

// Custom sorting function based on division rankings
export const divisionsSortedByRank = (a: Division, b: Division): number => {
  // Find the ranks of the first division in each group
  const rankA =
    divisionRankings.find((division) => division.name === a.division)?.rank ||
    0;
  const rankB =
    divisionRankings.find((division) => division.name === b.division)?.rank ||
    0;

  // Compare ranks and return the result
  return rankA - rankB;
};

export function pointsCalculation(
  position: number,
  multiplier: number,
  data: CSVRow[]
) {
  const numberOfPlayers = data.length;

  const adjustment1 = 1 + multiplier / 100;

  const calc =
    1 + Math.floor(((numberOfPlayers - position) / (numberOfPlayers - 1)) * 99);

  return Math.floor(adjustment1 * calc);
}

const pr = new Intl.PluralRules("en-US", { type: "ordinal" });

const suffixes = new Map([
  ["one", "st"],
  ["two", "nd"],
  ["few", "rd"],
  ["other", "th"],
]);

export const formatOrdinals = (n: number) => {
  const rule = pr.select(n);
  const suffix = suffixes.get(rule);
  return `${n}${suffix}`;
};

export const playerChecker = (
  jsonData: any[],
  existingPlayers: any[],
  updatePlayers: any[],
  newPlayers: any[]
) => {
  // Create maps for faster lookups
  const existingPlayerMapById = new Map(
    existingPlayers.map((player) => [player.pdga_num, player])
  );
  const existingPlayerMapByName = new Map(
    existingPlayers.map((player) => {
      const key = `${player.first_name}-${player.last_name}`;
      return [key, player];
    })
  );

  jsonData.forEach((player) => {
    const pdgaKey = player.PDGANum;
    const nameKey = `${player.FirstName}-${player.LastName}`;

    // Check if player exists by PDGA number
    if (existingPlayerMapById.has(pdgaKey)) {
      // Player already exists with this PDGA number
      return;
    }

    // Check for potential matches by name
    const potentialMatch = existingPlayerMapByName.get(nameKey);

    if (potentialMatch && potentialMatch.has_no_pdga_num) {
      // Update existing player with new PDGA number
      updatePlayers.push({
        id: potentialMatch.id!,
        pdga_num: pdgaKey,
        has_no_pdga_num: false,
      });
    } else {
      // New player
      newPlayers.push(player);
    }
  });
};