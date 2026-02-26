"use client";

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type {
  Player,
  FormationType,
  QuarterLineup,
  FormationPosition,
  Position,
} from "@/lib/types";
import { FORMATIONS, getPositionCategory } from "@/lib/types";

interface LineupState {
  players: Player[];
  formation: FormationType;
  quarterLineups: QuarterLineup[];
  currentStep: number; // 0: roster, 1: attendance, 2: formation/lineup, 3: pitch view
  selectedQuarter: number; // 0-3
}

type LineupAction =
  | { type: "SET_PLAYERS"; players: Player[] }
  | { type: "ADD_PLAYER"; player: Player }
  | { type: "UPDATE_PLAYER"; id: string; updates: Partial<Player> }
  | { type: "REMOVE_PLAYER"; id: string }
  | { type: "TOGGLE_ATTENDANCE"; id: string }
  | {
    type: "TOGGLE_QUARTER";
    id: string;
    quarter: number;
  }
  | { type: "SET_FORMATION"; formation: FormationType }
  | { type: "GENERATE_LINEUPS" }
  | { type: "SET_QUARTER_LINEUPS"; lineups: QuarterLineup[] }
  | { type: "SET_STEP"; step: number }
  | { type: "SET_SELECTED_QUARTER"; quarter: number }
  | { type: "LOAD_STATE"; state: LineupState }
  | {
    type: "SWAP_PLAYER";
    quarter: number;
    positionIndex: number;
    newPlayerId: string;
  }
  | {
    type: "SWAP_STARTERS";
    quarter: number;
    index1: number;
    index2: number;
  };

const initialState: LineupState = {
  players: [],
  formation: "4-3-3",
  quarterLineups: [],
  currentStep: 0,
  selectedQuarter: 0,
};

function getSkillScore(level: string): number {
  switch (level) {
    case "High":
      return 3;
    case "Medium":
      return 2;
    case "Low":
      return 1;
    default:
      return 1;
  }
}

function positionMatchScore(
  playerMainPos: Position,
  playerSubPos: Position | "",
  targetRole: Position
): number {
  if (playerMainPos === targetRole) return 10;
  if (playerSubPos === targetRole) return 7;

  const playerCat = getPositionCategory(playerMainPos);
  const targetCat = getPositionCategory(targetRole);
  if (playerCat === targetCat) return 4;

  const adjacency: Record<string, string[]> = {
    GK: ["DF"],
    DF: ["GK", "MF"],
    MF: ["DF", "FW"],
    FW: ["MF"],
  };
  if (adjacency[playerCat]?.includes(targetCat)) return 2;
  return 0;
}

function generateLineups(
  players: Player[],
  formation: FormationType
): QuarterLineup[] {
  const formationPositions = FORMATIONS[formation];
  const quarters: QuarterLineup[] = [];

  const attendingPlayers = players.filter((p) => p.is_attending);
  const playCount: Record<string, number> = {};
  attendingPlayers.forEach((p) => (playCount[p.id] = 0));

  const forcedGks = new Set<string>();

  for (let q = 0; q < 4; q++) {
    const isEliteQuarter = q === 1; // 2Q is designated as Elite Quarter (정예 쿼터)
    const available = attendingPlayers.filter((p) => p.available_quarters[q]);

    // 1. Shuffle initially to prevent bias
    let pool = [...available].sort(() => Math.random() - 0.5);

    // 2. Sort by Play Count (Fairness Model), then by skill if Elite Quarter
    pool.sort((a, b) => {
      const countA = playCount[a.id] || 0;
      const countB = playCount[b.id] || 0;
      if (countA !== countB) return countA - countB;

      if (isEliteQuarter) {
        return getSkillScore(b.skill_level) - getSkillScore(a.skill_level);
      }
      return 0;
    });

    const starters: { position: FormationPosition; playerId: string }[] = [];
    const assigned = new Set<string>();

    // GK Special Rule (Condition 4)
    const gkPos = formationPositions.find((p) => p.role === "GK");
    if (gkPos) {
      let gk = pool.find(
        (p) =>
          !assigned.has(p.id) &&
          (p.main_pos === "GK" || p.sub_pos === "GK")
      );

      // If no 전업 GK found for this quarter, force a field player
      if (!gk) {
        // Try to pick someone who hasn't been forced yet
        let candidates = pool.filter(p => !assigned.has(p.id) && !forcedGks.has(p.id));
        if (candidates.length === 0) {
          candidates = pool.filter(p => !assigned.has(p.id));
        }
        if (candidates.length > 0) {
          // Prefer lowest play counts from candidates, which is naturally first due to our global sort
          gk = candidates[0];
          forcedGks.add(gk.id);
        }
      }

      if (gk) {
        starters.push({ position: gkPos, playerId: gk.id });
        assigned.add(gk.id);
      }
    }

    // Other positions
    const otherPositions = formationPositions.filter((p) => p.role !== "GK");
    for (const pos of otherPositions) {
      const positionCandidates = pool
        .filter((p) => !assigned.has(p.id))
        .sort((a, b) => {
          // Play count still wins
          const countA = playCount[a.id] || 0;
          const countB = playCount[b.id] || 0;
          if (countA !== countB) return countA - countB;

          // Skill in Elite quarter wins over position
          if (isEliteQuarter) {
            const skillA = getSkillScore(a.skill_level);
            const skillB = getSkillScore(b.skill_level);
            if (skillA !== skillB) return skillB - skillA;
          }

          // Otherwise position matching
          return positionMatchScore(b.main_pos, b.sub_pos, pos.role) -
            positionMatchScore(a.main_pos, a.sub_pos, pos.role);
        });

      if (positionCandidates.length > 0) {
        starters.push({ position: pos, playerId: positionCandidates[0].id });
        assigned.add(positionCandidates[0].id);
      }
    }

    // Update play counts
    starters.forEach((s) => {
      playCount[s.playerId] = (playCount[s.playerId] || 0) + 1;
    });

    const subs = available
      .filter((p) => !assigned.has(p.id))
      .map((p) => p.id);

    quarters.push({ quarter: q + 1, starters, subs });
  }

  return quarters;
}

function lineupReducer(
  state: LineupState,
  action: LineupAction
): LineupState {
  switch (action.type) {
    case "SET_PLAYERS":
      return { ...state, players: action.players };
    case "ADD_PLAYER":
      return { ...state, players: [...state.players, action.player] };
    case "UPDATE_PLAYER":
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.id ? { ...p, ...action.updates } : p
        ),
      };
    case "REMOVE_PLAYER":
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.id),
      };
    case "TOGGLE_ATTENDANCE": {
      const player = state.players.find((p) => p.id === action.id);
      if (!player) return state;
      const newAttending = !player.is_attending;
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.id
            ? {
              ...p,
              is_attending: newAttending,
              available_quarters: newAttending
                ? [true, true, true, true]
                : [false, false, false, false],
            }
            : p
        ),
      };
    }
    case "TOGGLE_QUARTER": {
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id !== action.id) return p;
          const newQ = [...p.available_quarters] as [
            boolean,
            boolean,
            boolean,
            boolean
          ];
          newQ[action.quarter] = !newQ[action.quarter];
          const anyActive = newQ.some(Boolean);
          return {
            ...p,
            available_quarters: newQ,
            is_attending: anyActive,
          };
        }),
      };
    }
    case "SET_FORMATION":
      return { ...state, formation: action.formation };
    case "GENERATE_LINEUPS":
      return {
        ...state,
        quarterLineups: generateLineups(state.players, state.formation),
      };
    case "SET_QUARTER_LINEUPS":
      return { ...state, quarterLineups: action.lineups };
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "SET_SELECTED_QUARTER":
      return { ...state, selectedQuarter: action.quarter };
    case "SWAP_PLAYER": {
      const newLineups = [...state.quarterLineups];
      const ql = { ...newLineups[action.quarter] };
      const newStarters = [...ql.starters];

      const oldPlayerId = newStarters[action.positionIndex].playerId;
      newStarters[action.positionIndex] = {
        ...newStarters[action.positionIndex],
        playerId: action.newPlayerId,
      };

      let newSubs = [...ql.subs];
      newSubs = newSubs.filter((id) => id !== action.newPlayerId);
      if (oldPlayerId) {
        newSubs.push(oldPlayerId);
      }

      ql.starters = newStarters;
      ql.subs = newSubs;
      newLineups[action.quarter] = ql;
      return { ...state, quarterLineups: newLineups };
    }
    case "SWAP_STARTERS": {
      const newLineups = [...state.quarterLineups];
      const ql = { ...newLineups[action.quarter] };
      const newStarters = [...ql.starters];

      const p1 = newStarters[action.index1].playerId;
      const p2 = newStarters[action.index2].playerId;

      newStarters[action.index1] = {
        ...newStarters[action.index1],
        playerId: p2,
      };
      newStarters[action.index2] = {
        ...newStarters[action.index2],
        playerId: p1,
      };

      ql.starters = newStarters;
      newLineups[action.quarter] = ql;
      return { ...state, quarterLineups: newLineups };
    }
    case "LOAD_STATE": {
      return action.state;
    }
    default:
      return state;
  }
}

const LineupContext = createContext<{
  state: LineupState;
  dispatch: React.Dispatch<LineupAction>;
} | null>(null);

const LOCAL_STORAGE_KEY = "lineupmaker_state";

export function LineupProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(lineupReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        dispatch({ type: "LOAD_STATE", state: JSON.parse(saved) });
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }, [state]);

  return (
    <LineupContext.Provider value={{ state, dispatch }}>
      {children}
    </LineupContext.Provider>
  );
}

export function useLineup() {
  const ctx = useContext(LineupContext);
  if (!ctx) throw new Error("useLineup must be used within LineupProvider");
  return ctx;
}
