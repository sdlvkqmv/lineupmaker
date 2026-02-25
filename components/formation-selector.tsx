"use client";

import { useState } from "react";
import { useLineup } from "@/lib/lineup-context";
import type { FormationType } from "@/lib/types";
import { FORMATIONS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

const FORMATION_OPTIONS: FormationType[] = [
  "4-3-3",
  "4-4-2",
  "4-2-3-1",
  "3-5-2",
  "3-4-3",
  "5-3-2",
];

function MiniPitch({ formation }: { formation: FormationType }) {
  const positions = FORMATIONS[formation];
  return (
    <div className="relative aspect-[3/4] w-full rounded-lg bg-pitch/50">
      {/* Field lines */}
      <div className="absolute inset-x-0 top-[50%] border-t border-pitch-line" />
      <div className="absolute left-[50%] top-[50%] size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-pitch-line" />
      {positions.map((pos, i) => (
        <div
          key={i}
          className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        />
      ))}
    </div>
  );
}

export function FormationSelector() {
  const { state, dispatch } = useLineup();
  const [selected, setSelected] = useState<FormationType>(state.formation);

  function handleGenerate() {
    dispatch({ type: "SET_FORMATION", formation: selected });
    dispatch({ type: "GENERATE_LINEUPS" });
    dispatch({ type: "SET_STEP", step: 2 });
  }

  const attending = state.players.filter((p) => p.is_attending);

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 py-3">
        <h2 className="text-lg font-bold text-foreground">포메이션 선택</h2>
        <p className="text-xs text-muted-foreground">
          참석 인원 {attending.length}명
        </p>
      </div>

      <div className="flex-1 px-4">
        <div className="grid grid-cols-3 gap-3">
          {FORMATION_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setSelected(f)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${
                selected === f
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <MiniPitch formation={f} />
              <span
                className={`text-sm font-bold ${
                  selected === f ? "text-primary" : "text-foreground"
                }`}
              >
                {f}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 border-t border-border p-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => dispatch({ type: "SET_STEP", step: 1 })}
        >
          이전
        </Button>
        <Button
          className="flex-1 gap-2 bg-primary text-primary-foreground"
          onClick={handleGenerate}
        >
          <Wand2 className="size-4" />
          자동 생성
        </Button>
      </div>
    </div>
  );
}
