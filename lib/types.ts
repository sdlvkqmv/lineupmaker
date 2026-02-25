export type Position =
  | "GK"
  | "CB"
  | "LB"
  | "RB"
  | "CDM"
  | "CM"
  | "CAM"
  | "LM"
  | "RM"
  | "LW"
  | "RW"
  | "ST"
  | "CF";

export type SkillLevel = "High" | "Medium" | "Low";

export type PositionCategory = "GK" | "DF" | "MF" | "FW";

export interface Player {
  id: string;
  name: string;
  number?: number;
  main_pos: Position;
  sub_pos: Position | "";
  skill_level: SkillLevel;
  is_mercenary: boolean;
  is_attending: boolean;
  available_quarters: [boolean, boolean, boolean, boolean]; // Q1, Q2, Q3, Q4
}

export type FormationType =
  | "4-3-3"
  | "4-4-2"
  | "3-5-2"
  | "4-2-3-1"
  | "3-4-3"
  | "5-3-2";

export interface FormationPosition {
  role: Position;
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
}

export interface QuarterLineup {
  quarter: number;
  starters: { position: FormationPosition; playerId: string }[];
  subs: string[];
}

export const FORMATIONS: Record<FormationType, FormationPosition[]> = {
  "4-3-3": [
    { role: "GK", x: 50, y: 90 },
    { role: "LB", x: 15, y: 70 },
    { role: "CB", x: 38, y: 73 },
    { role: "CB", x: 62, y: 73 },
    { role: "RB", x: 85, y: 70 },
    { role: "CM", x: 30, y: 50 },
    { role: "CDM", x: 50, y: 55 },
    { role: "CM", x: 70, y: 50 },
    { role: "LW", x: 18, y: 28 },
    { role: "ST", x: 50, y: 22 },
    { role: "RW", x: 82, y: 28 },
  ],
  "4-4-2": [
    { role: "GK", x: 50, y: 90 },
    { role: "LB", x: 15, y: 70 },
    { role: "CB", x: 38, y: 73 },
    { role: "CB", x: 62, y: 73 },
    { role: "RB", x: 85, y: 70 },
    { role: "LM", x: 15, y: 48 },
    { role: "CM", x: 38, y: 52 },
    { role: "CM", x: 62, y: 52 },
    { role: "RM", x: 85, y: 48 },
    { role: "ST", x: 38, y: 25 },
    { role: "ST", x: 62, y: 25 },
  ],
  "3-5-2": [
    { role: "GK", x: 50, y: 90 },
    { role: "CB", x: 25, y: 73 },
    { role: "CB", x: 50, y: 75 },
    { role: "CB", x: 75, y: 73 },
    { role: "LM", x: 10, y: 50 },
    { role: "CM", x: 32, y: 52 },
    { role: "CDM", x: 50, y: 56 },
    { role: "CM", x: 68, y: 52 },
    { role: "RM", x: 90, y: 50 },
    { role: "ST", x: 38, y: 25 },
    { role: "ST", x: 62, y: 25 },
  ],
  "4-2-3-1": [
    { role: "GK", x: 50, y: 90 },
    { role: "LB", x: 15, y: 70 },
    { role: "CB", x: 38, y: 73 },
    { role: "CB", x: 62, y: 73 },
    { role: "RB", x: 85, y: 70 },
    { role: "CDM", x: 38, y: 55 },
    { role: "CDM", x: 62, y: 55 },
    { role: "LW", x: 18, y: 35 },
    { role: "CAM", x: 50, y: 38 },
    { role: "RW", x: 82, y: 35 },
    { role: "ST", x: 50, y: 20 },
  ],
  "3-4-3": [
    { role: "GK", x: 50, y: 90 },
    { role: "CB", x: 25, y: 73 },
    { role: "CB", x: 50, y: 75 },
    { role: "CB", x: 75, y: 73 },
    { role: "LM", x: 15, y: 50 },
    { role: "CM", x: 38, y: 52 },
    { role: "CM", x: 62, y: 52 },
    { role: "RM", x: 85, y: 50 },
    { role: "LW", x: 20, y: 25 },
    { role: "ST", x: 50, y: 22 },
    { role: "RW", x: 80, y: 25 },
  ],
  "5-3-2": [
    { role: "GK", x: 50, y: 90 },
    { role: "LB", x: 10, y: 65 },
    { role: "CB", x: 30, y: 73 },
    { role: "CB", x: 50, y: 75 },
    { role: "CB", x: 70, y: 73 },
    { role: "RB", x: 90, y: 65 },
    { role: "CM", x: 30, y: 50 },
    { role: "CDM", x: 50, y: 55 },
    { role: "CM", x: 70, y: 50 },
    { role: "ST", x: 38, y: 25 },
    { role: "ST", x: 62, y: 25 },
  ],
};

export function getPositionCategory(pos: Position): PositionCategory {
  if (pos === "GK") return "GK";
  if (["CB", "LB", "RB"].includes(pos)) return "DF";
  if (["CDM", "CM", "CAM", "LM", "RM"].includes(pos)) return "MF";
  return "FW";
}

export function getPositionColor(pos: Position): string {
  const cat = getPositionCategory(pos);
  switch (cat) {
    case "GK":
      return "text-chart-4";
    case "DF":
      return "text-skill-low";
    case "MF":
      return "text-skill-high";
    case "FW":
      return "text-chart-5";
  }
}

export const ALL_POSITIONS: Position[] = [
  "GK",
  "CB",
  "LB",
  "RB",
  "CDM",
  "CM",
  "CAM",
  "LM",
  "RM",
  "LW",
  "RW",
  "ST",
  "CF",
];
