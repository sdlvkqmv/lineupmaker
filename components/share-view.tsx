"use client";

import { useRef, useCallback, useState } from "react";
import { useLineup } from "@/lib/lineup-context";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download } from "lucide-react";
import { toPng } from "html-to-image";
import { PitchSVG, getPositionBgColor } from "./lineup-view";

const QUARTER_LABELS = ["1Q", "2Q", "3Q", "4Q"];

function StaticPitchPlayer({ starter, player, playCount }: any) {
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
      style={{ left: `${starter.position.x}%`, top: `${starter.position.y}%` }}
    >
      <div className={`relative flex size-9 items-center justify-center rounded-full text-xs font-bold shadow-md ${getPositionBgColor(starter.position.role)} text-card`}>
        {player.number ?? player.name.charAt(0)}
        <div className={`absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full border border-pitch text-[8px] font-extrabold text-black ${player.skill_level === "High" ? "bg-skill-high" : player.skill_level === "Medium" ? "bg-skill-medium" : "bg-skill-low"
          }`}>
          {player.skill_level === "High" ? "상" : player.skill_level === "Medium" ? "중" : "하"}
        </div>
        <div className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-pitch bg-foreground px-1 text-[9px] font-black text-background shadow-sm">
          {playCount}Q
        </div>
      </div>
      <span className="max-w-16 truncate rounded-sm bg-background/80 px-1 text-[10px] font-semibold text-foreground backdrop-blur-sm">
        {player.name}
      </span>
      <span className="text-[9px] font-medium text-foreground/70">
        {starter.position.role}
      </span>
    </div>
  );
}

export function ShareView() {
  const { state, dispatch } = useLineup();
  const pitchRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [downloading, setDownloading] = useState<number | null>(null);

  function getPlayerById(id: string) {
    return state.players.find((p) => p.id === id);
  }

  function getPlayerPlayCount(id: string) {
    return state.quarterLineups.reduce(
      (count, ql) => count + (ql.starters.some((s) => s.playerId === id) ? 1 : 0),
      0
    );
  }

  const handleDownloadImage = useCallback(async (qi: number) => {
    const node = pitchRefs.current[qi];
    if (!node) return;

    setDownloading(qi);
    try {
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement("a");
      link.download = `lineup-${state.formation}-${QUARTER_LABELS[qi]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
    } finally {
      setDownloading(null);
    }
  }, [state.formation]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <button
          onClick={() => dispatch({ type: "SET_STEP", step: 3 })}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="이전으로"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">이미지 저장</h2>
          <p className="text-xs text-muted-foreground">{state.formation} 라인업</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-6 items-center">
        {state.quarterLineups.map((ql, qi) => (
          <div key={qi} className="w-full max-w-sm flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-lg font-bold">{QUARTER_LABELS[qi]}</span>
              <Button
                size="sm"
                variant="default"
                disabled={downloading === qi}
                onClick={() => handleDownloadImage(qi)}
              >
                {downloading === qi ? "저장 중..." : <><Download className="mr-1 size-3.5" /> 저장</>}
              </Button>
            </div>

            <div
              ref={(el) => {
                pitchRefs.current[qi] = el;
              }}
              className="relative aspect-[68/100] w-full overflow-hidden rounded-xl border border-pitch-line bg-pitch shadow-lg"
            >
              <PitchSVG />
              <div className="absolute left-3 top-2 opacity-70">
                <div className="text-xl font-black italic text-white">{QUARTER_LABELS[qi]}</div>
                <div className="text-xs font-semibold text-white/80">{state.formation}</div>
              </div>

              {ql.starters.map((starter, idx) => {
                const player = getPlayerById(starter.playerId);
                if (!player) return null;
                return <StaticPitchPlayer key={`${qi}-${idx}`} starter={starter} player={player} playCount={getPlayerPlayCount(player.id)} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
