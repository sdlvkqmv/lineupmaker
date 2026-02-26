"use client";

import { useState } from "react";
import { useLineup } from "@/lib/lineup-context";
import { getPositionCategory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, RefreshCw } from "lucide-react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";

const QUARTER_LABELS = ["1Q", "2Q", "3Q", "4Q"];

export function PitchSVG() {
  return (
    <svg
      viewBox="0 0 340 500"
      className="absolute inset-0 size-full pointer-events-none"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Pitch background */}
      <rect width="340" height="500" className="fill-pitch" />

      {/* Outer lines */}
      <rect x="10" y="10" width="320" height="480" rx="2" className="stroke-pitch-line" strokeWidth="1.5" />

      {/* Center line */}
      <line x1="10" y1="250" x2="330" y2="250" className="stroke-pitch-line" strokeWidth="1.5" />

      {/* Center circle */}
      <circle cx="170" cy="250" r="50" className="stroke-pitch-line" strokeWidth="1.5" />
      <circle cx="170" cy="250" r="3" className="fill-pitch-line" />

      {/* Top penalty area */}
      <rect x="70" y="10" width="200" height="90" className="stroke-pitch-line" strokeWidth="1.5" />
      <rect x="110" y="10" width="120" height="40" className="stroke-pitch-line" strokeWidth="1.5" />
      <circle cx="170" cy="72" r="3" className="fill-pitch-line" />
      <path d="M 120 100 Q 170 125 220 100" className="stroke-pitch-line" strokeWidth="1.5" />

      {/* Bottom penalty area */}
      <rect x="70" y="400" width="200" height="90" className="stroke-pitch-line" strokeWidth="1.5" />
      <rect x="110" y="450" width="120" height="40" className="stroke-pitch-line" strokeWidth="1.5" />
      <circle cx="170" cy="428" r="3" className="fill-pitch-line" />
      <path d="M 120 400 Q 170 375 220 400" className="stroke-pitch-line" strokeWidth="1.5" />

      {/* Corner arcs */}
      <path d="M 10 20 Q 20 10 30 10" className="stroke-pitch-line" strokeWidth="1.5" />
      <path d="M 310 10 Q 320 10 330 20" className="stroke-pitch-line" strokeWidth="1.5" />
      <path d="M 10 480 Q 20 490 30 490" className="stroke-pitch-line" strokeWidth="1.5" />
      <path d="M 310 490 Q 320 490 330 480" className="stroke-pitch-line" strokeWidth="1.5" />
    </svg>
  );
}

export function getPositionBgColor(role: string) {
  const cat = getPositionCategory(role as any);
  switch (cat) {
    case "GK":
      return "bg-chart-4";
    case "DF":
      return "bg-skill-low";
    case "MF":
      return "bg-skill-high";
    case "FW":
      return "bg-chart-5";
  }
}

function PitchPlayer({ starter, positionIndex, player, playCount }: any) {
  const id = `starter-${positionIndex}`;
  const { setNodeRef: setDroppableRef } = useDroppable({
    id,
    data: { type: "starter", positionIndex },
  });

  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id,
    data: { type: "starter", positionIndex, player, role: starter.position.role },
  });

  return (
    <div
      ref={setDroppableRef}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
      style={{ left: `${starter.position.x}%`, top: `${starter.position.y}%` }}
    >
      <button
        ref={setDraggableRef}
        {...listeners}
        {...attributes}
        className={`flex flex-col items-center gap-0.5 touch-pan-y ${isDragging ? "opacity-0" : ""}`}
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
      </button>
    </div>
  );
}

function SubPlayer({ subId, player, playCount }: any) {
  const id = `sub-${subId}`;
  const { setNodeRef: setDroppableRef } = useDroppable({
    id,
    data: { type: "sub", subId },
  });

  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id,
    data: { type: "sub", subId, player },
  });

  return (
    <div ref={setDroppableRef}>
      <Badge
        ref={setDraggableRef}
        {...listeners}
        {...attributes}
        variant="secondary"
        className={`gap-1 py-1 pl-1 pr-2 text-xs touch-pan-y cursor-grab active:cursor-grabbing ${isDragging ? "opacity-0" : ""}`}
      >
        <span className={`flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-black ${player.skill_level === "High" ? "bg-skill-high" : player.skill_level === "Medium" ? "bg-skill-medium" : "bg-skill-low"
          }`}>
          {player.skill_level === "High" ? "상" : player.skill_level === "Medium" ? "중" : "하"}
        </span>
        {player.name}
        <span className="text-muted-foreground">{player.main_pos}</span>
        <span className="ml-0.5 rounded-sm bg-primary/20 px-1 py-0.5 text-[9px] font-bold text-primary">
          {playCount}Q
        </span>
      </Badge>
    </div>
  );
}

export function LineupView() {
  const { state, dispatch } = useLineup();
  const [activeDrag, setActiveDrag] = useState<any>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const q = state.selectedQuarter;
  const lineup = state.quarterLineups[q];

  if (!lineup) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">라인업이 생성되지 않았습니다</p>
      </div>
    );
  }

  function getPlayerById(id: string) {
    return state.players.find((p) => p.id === id);
  }

  function getPlayerPlayCount(id: string) {
    return state.quarterLineups.reduce(
      (count, ql) => count + (ql.starters.some((s) => s.playerId === id) ? 1 : 0),
      0
    );
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveDrag(e.active.data.current);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = e;
    if (!over) return;

    const sourceData = active.data.current;
    const destData = over.data.current;

    if (!sourceData || !destData) return;

    // source: starter, dest: starter
    if (sourceData.type === "starter" && destData.type === "starter") {
      dispatch({
        type: "SWAP_STARTERS",
        quarter: q,
        index1: sourceData.positionIndex,
        index2: destData.positionIndex,
      });
      return;
    }

    // source: starter, dest: sub
    if (sourceData.type === "starter" && destData.type === "sub") {
      dispatch({
        type: "SWAP_PLAYER",
        quarter: q,
        positionIndex: sourceData.positionIndex,
        newPlayerId: destData.subId,
      });
      return;
    }

    // source: sub, dest: starter
    if (sourceData.type === "sub" && destData.type === "starter") {
      dispatch({
        type: "SWAP_PLAYER",
        quarter: q,
        positionIndex: destData.positionIndex,
        newPlayerId: sourceData.subId,
      });
      return;
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: "SET_QUARTER_LINEUPS", lineups: [] })}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-foreground">{state.formation}</h2>
              <p className="text-xs text-muted-foreground">드래그하여 선수 교체</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => dispatch({ type: "GENERATE_LINEUPS" })}>
              <RefreshCw className="size-3.5" />
              재생성
            </Button>
            <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground" onClick={() => dispatch({ type: "SET_STEP", step: 3 })}>
              <Share2 className="size-3.5" />
              공유
            </Button>
          </div>
        </div>

        {/* Quarters */}
        <div className="flex gap-2 px-4 pb-3">
          {QUARTER_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => dispatch({ type: "SET_SELECTED_QUARTER", quarter: i })}
              className={`flex flex-1 flex-col items-center justify-center rounded-lg py-1 transition-colors ${state.selectedQuarter === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
            >
              <span className="text-sm font-bold">{label}</span>
              {i === state.eliteQuarter && (
                <span className="text-[9px] font-medium opacity-80 -mt-0.5">
                  엘리트 쿼터
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pitch Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pb-2">
            <div className="relative mx-auto aspect-[68/100] max-h-[60vh] overflow-hidden rounded-xl bg-pitch">
              <PitchSVG />
              {lineup.starters.map((starter, idx) => {
                const player = getPlayerById(starter.playerId);
                if (!player) return null;
                return <PitchPlayer key={`${q}-${idx}`} starter={starter} positionIndex={idx} player={player} playCount={getPlayerPlayCount(player.id)} />;
              })}
            </div>
          </div>

          {/* Substitutes */}
          {lineup.subs.length > 0 && (
            <div className="border-t border-border px-4 py-3 pb-20">
              <p className="mb-2 text-xs font-medium text-muted-foreground">대기 명단 ({lineup.subs.length}명)</p>
              <div className="flex flex-wrap gap-2">
                {lineup.subs.map((subId) => {
                  const player = getPlayerById(subId);
                  if (!player) return null;
                  return <SubPlayer key={subId} subId={subId} player={player} playCount={getPlayerPlayCount(player.id)} />;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag?.type === "starter" ? (
          <div className="flex flex-col items-center gap-0.5 opacity-80 cursor-grabbing scale-110 transition-transform">
            <div className={`relative flex size-9 items-center justify-center rounded-full text-xs font-bold shadow-md ${getPositionBgColor(activeDrag.role)} text-card`}>
              {activeDrag.player.number ?? activeDrag.player.name.charAt(0)}
              <div className={`absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full border border-pitch text-[8px] font-extrabold text-black ${activeDrag.player.skill_level === "High" ? "bg-skill-high" : activeDrag.player.skill_level === "Medium" ? "bg-skill-medium" : "bg-skill-low"
                }`}>
                {activeDrag.player.skill_level === "High" ? "상" : activeDrag.player.skill_level === "Medium" ? "중" : "하"}
              </div>
              <div className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-pitch bg-foreground px-1 text-[9px] font-black text-background shadow-sm">
                {getPlayerPlayCount(activeDrag.player.id)}Q
              </div>
            </div>
            <span className="max-w-16 truncate rounded-sm bg-background/80 px-1 text-[10px] font-semibold text-foreground backdrop-blur-sm">
              {activeDrag.player.name}
            </span>
            <span className="text-[9px] font-medium text-foreground/70">{activeDrag.role}</span>
          </div>
        ) : activeDrag?.type === "sub" ? (
          <Badge variant="secondary" className="gap-1 py-1 pl-1 pr-2 text-xs opacity-80 cursor-grabbing scale-105 transition-transform">
            <span className={`flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-black ${activeDrag.player.skill_level === "High" ? "bg-skill-high" : activeDrag.player.skill_level === "Medium" ? "bg-skill-medium" : "bg-skill-low"
              }`}>
              {activeDrag.player.skill_level === "High" ? "상" : activeDrag.player.skill_level === "Medium" ? "중" : "하"}
            </span>
            {activeDrag.player.name}
            <span className="text-muted-foreground">{activeDrag.player.main_pos}</span>
            <span className="ml-0.5 rounded-sm bg-primary/20 px-1 py-0.5 text-[9px] font-bold text-primary">
              {getPlayerPlayCount(activeDrag.player.id)}Q
            </span>
          </Badge>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
