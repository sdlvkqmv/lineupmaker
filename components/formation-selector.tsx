"use client";

import { useState } from "react";
import { useLineup } from "@/lib/lineup-context";
import type { FormationType } from "@/lib/types";
import { FORMATIONS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FORMATION_OPTIONS: FormationType[] = [
  "4-3-3",
  "4-4-2",
  "4-2-3-1",
  "3-5-2",
  "3-4-3",
  "5-3-2",
];

const QUARTER_LABELS = ["1Q", "2Q", "3Q", "4Q"];

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
  const [eliteQuarter, setEliteQuarter] = useState<number | null>(state.eliteQuarter !== null ? state.eliteQuarter : 1);

  function handleGenerate() {
    dispatch({ type: "SET_FORMATION", formation: selected });
    dispatch({ type: "SET_ELITE_QUARTER", quarter: eliteQuarter });
    dispatch({ type: "GENERATE_LINEUPS" });
    dispatch({ type: "SET_STEP", step: 2 });
  }

  const attending = state.players.filter((p) => p.is_attending);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 py-3">
        <h2 className="text-lg font-bold text-foreground">포메이션 및 전략 설정</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          참석 인원 {attending.length}명
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary" />
            기본 포메이션
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {FORMATION_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => setSelected(f)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${selected === f
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                  }`}
              >
                <MiniPitch formation={f} />
                <span
                  className={`text-sm font-bold ${selected === f ? "text-primary" : "text-foreground"
                    }`}
                >
                  {f}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-1 text-sm font-semibold flex items-center gap-2">
            <div className="size-2 rounded-full bg-chart-2" />
            <span className="text-chart-2">정예(엘리트) 쿼터</span>
          </h3>
          <p className="text-[11px] text-muted-foreground mb-3 font-medium">
            베스트 11을 가동하고 싶은 쿼터를 선택하세요. 해당 쿼터는 실력이 우선적으로 고려됩니다.
          </p>
          <div className="flex gap-2 w-full">
            {QUARTER_LABELS.map((label, qIndex) => (
              <button
                key={label}
                onClick={() => setEliteQuarter(eliteQuarter === qIndex ? null : qIndex)}
                className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-colors ${eliteQuarter === qIndex
                    ? "border-chart-2 bg-chart-2/15 text-chart-2"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
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
