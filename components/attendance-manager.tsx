"use client";

import { useState, useMemo } from "react";
import { useLineup } from "@/lib/lineup-context";
import type { Player, Position, SkillLevel } from "@/lib/types";
import { ALL_POSITIONS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, UserPlus, Search, ArrowUpDown } from "lucide-react";
import { getChoseong } from "es-hangul";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const QUARTER_LABELS = ["1Q", "2Q", "3Q", "4Q"];

type SortType = "name" | "number" | "position" | "skill";

export function AttendanceManager() {
  const { state, dispatch } = useLineup();
  const [mercenaryDialogOpen, setMercenaryDialogOpen] = useState(false);
  const [mercName, setMercName] = useState("");
  const [mercPos, setMercPos] = useState<Position>("CM");
  const [mercSkill, setMercSkill] = useState<SkillLevel>("Medium");
  const [mercQuarters, setMercQuarters] = useState<[boolean, boolean, boolean, boolean]>([
    true,
    true,
    true,
    true,
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState<SortType>("number");

  const attending = state.players.filter((p) => p.is_attending);
  const totalQ = [0, 1, 2, 3].map(
    (q) => state.players.filter((p) => p.is_attending && p.available_quarters[q]).length
  );

  const filteredAndSortedPlayers = useMemo(() => {
    let result = [...state.players];

    // 1. Search (Choseong Support)
    if (searchTerm) {
      result = result.filter(p => {
        const nameMatch = p.name.includes(searchTerm) || getChoseong(p.name).includes(searchTerm);
        const numMatch = p.number?.toString().includes(searchTerm);
        return nameMatch || numMatch;
      });
    }

    // 2. Sort
    result.sort((a, b) => {
      // 용병은 항상 마지막
      if (a.is_mercenary !== b.is_mercenary) {
        return a.is_mercenary ? 1 : -1;
      }

      switch (sortType) {
        case "name":
          return a.name.localeCompare(b.name);
        case "number":
          const numA = a.number ?? 999;
          const numB = b.number ?? 999;
          return numA - numB;
        case "position":
          return a.main_pos.localeCompare(b.main_pos);
        case "skill": {
          const scoreMap: Record<SkillLevel, number> = { High: 3, Medium: 2, Low: 1 };
          return scoreMap[b.skill_level] - scoreMap[a.skill_level];
        }
        default:
          return 0;
      }
    });

    return result;
  }, [state.players, searchTerm, sortType]);

  function handleAddMercenary() {
    if (!mercName.trim()) return;
    const player: Player = {
      id: generateId(),
      name: mercName.trim(),
      main_pos: mercPos,
      sub_pos: "",
      skill_level: mercSkill,
      is_mercenary: true,
      is_attending: true,
      available_quarters: mercQuarters,
    };
    dispatch({ type: "ADD_PLAYER", player });
    setMercName("");
    setMercPos("CM");
    setMercSkill("Medium");
    setMercQuarters([true, true, true, true]);
    setMercenaryDialogOpen(false);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">참석 확인</h2>
          <p className="text-xs text-muted-foreground">
            참석 {attending.length}명 / 전체 {state.players.length}명
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-muted-foreground"
            onClick={() => {
              if (confirm("정말로 모든 참석자를 지우시겠습니까? (용병 포함)")) {
                dispatch({ type: "CLEAR_ATTENDANCE" });
              }
            }}
          >
            모두 지우기
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMercenaryDialogOpen(true)}
            className="gap-1.5"
          >
            <UserPlus className="size-3.5" />
            용병
          </Button>
        </div>
      </div>

      {/* Filter and Sort bar */}
      <div className="px-4 pb-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="이름/번호 (초성 가능)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-secondary border-border h-9 text-sm"
          />
        </div>
        <Select value={sortType} onValueChange={(v) => setSortType(v as SortType)}>
          <SelectTrigger className="w-[110px] bg-secondary border-border h-9 text-sm">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="number">번호순</SelectItem>
            <SelectItem value="name">이름순</SelectItem>
            <SelectItem value="skill">실력순</SelectItem>
            <SelectItem value="position">주포지션</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quarter Summary */}
      <div className="mx-4 mb-3 flex gap-2">
        {QUARTER_LABELS.map((label, i) => (
          <div
            key={label}
            className="flex flex-1 flex-col items-center rounded-lg border border-border bg-card p-2"
          >
            <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
            <span className="text-lg font-bold text-foreground">{totalQ[i]}</span>
            <span className="text-[10px] text-muted-foreground">명</span>
          </div>
        ))}
      </div>

      {/* Player List */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="flex flex-col gap-2 pb-4">
          {filteredAndSortedPlayers.map((player) => (
            <div
              key={player.id}
              className={`rounded-xl border transition-colors ${player.is_attending
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-card"
                }`}
            >
              {/* Player Row - tap to toggle attendance */}
              <button
                onClick={() =>
                  dispatch({ type: "TOGGLE_ATTENDANCE", id: player.id })
                }
                className="flex w-full items-center gap-3 p-3"
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${player.is_attending
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                    }`}
                >
                  {player.is_attending ? (
                    <Check className="size-4" />
                  ) : (
                    player.number ?? "-"
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${player.is_attending
                        ? "text-foreground"
                        : "text-muted-foreground"
                        }`}
                    >
                      {player.name}
                    </span>
                    {player.is_mercenary && (
                      <Badge variant="outline" className="border-chart-5/30 bg-chart-5/15 text-chart-5 text-[10px]">
                        용병
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {player.main_pos}
                    {player.sub_pos ? ` / ${player.sub_pos}` : ""}
                  </span>
                </div>
              </button>

              {/* Quarter Selection - only visible when attending */}
              {player.is_attending && (
                <div className="flex gap-2 px-3 pb-3">
                  {QUARTER_LABELS.map((label, qi) => (
                    <button
                      key={qi}
                      onClick={() =>
                        dispatch({
                          type: "TOGGLE_QUARTER",
                          id: player.id,
                          quarter: qi,
                        })
                      }
                      className={`flex flex-1 items-center justify-center rounded-lg py-2 text-xs font-semibold transition-colors ${player.available_quarters[qi]
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground/50 line-through"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-2 border-t border-border p-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => dispatch({ type: "SET_STEP", step: 0 })}
        >
          이전
        </Button>
        <Button
          className="flex-1 bg-primary text-primary-foreground"
          onClick={() => dispatch({ type: "SET_STEP", step: 2 })}
          disabled={attending.length < 11}
        >
          {attending.length < 11
            ? `${11 - attending.length}명 더 필요`
            : "라인업 생성"}
        </Button>
      </div>

      {/* Mercenary Dialog */}
      <Dialog open={mercenaryDialogOpen} onOpenChange={setMercenaryDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>용병 추가</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <Label className="text-muted-foreground mb-1.5 block text-xs">이름</Label>
              <Input
                value={mercName}
                onChange={(e) => setMercName(e.target.value)}
                placeholder="용병 이름"
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="text-muted-foreground mb-1.5 block text-xs">선호 포지션</Label>
                <Select value={mercPos} onValueChange={(v) => setMercPos(v as Position)}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_POSITIONS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-muted-foreground mb-1.5 block text-xs">실력</Label>
                <Select value={mercSkill} onValueChange={(v) => setMercSkill(v as SkillLevel)}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">상</SelectItem>
                    <SelectItem value="Medium">중</SelectItem>
                    <SelectItem value="Low">하</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground mb-1.5 block text-xs">참여 가능 쿼터</Label>
              <div className="flex gap-2">
                {QUARTER_LABELS.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const newQ = [...mercQuarters] as [boolean, boolean, boolean, boolean];
                      newQ[i] = !newQ[i];
                      setMercQuarters(newQ);
                    }}
                    className={`flex flex-1 items-center justify-center rounded-lg border py-2.5 text-sm font-semibold transition-colors ${mercQuarters[i]
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-secondary text-muted-foreground"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMercenaryDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleAddMercenary}
              disabled={!mercName.trim()}
              className="bg-primary text-primary-foreground"
            >
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
