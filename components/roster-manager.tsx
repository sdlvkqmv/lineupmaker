"use client";

import { useRef, useState, useEffect } from "react";
import Papa from "papaparse";
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
import {
  Upload,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function SkillBadge({ level }: { level: SkillLevel }) {
  const map: Record<SkillLevel, { label: string; className: string }> = {
    High: { label: "상", className: "bg-skill-high/20 text-skill-high border-skill-high/30" },
    Medium: { label: "중", className: "bg-skill-medium/20 text-skill-medium border-skill-medium/30" },
    Low: { label: "하", className: "bg-skill-low/20 text-skill-low border-skill-low/30" },
  };
  const config = map[level];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function PlayerEditDialog({
  open,
  onOpenChange,
  player,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: Partial<Player> | null;
  onSave: (player: Partial<Player>) => void;
}) {
  const [name, setName] = useState(player?.name ?? "");
  const [number, setNumber] = useState(player?.number?.toString() ?? "");
  const [mainPos, setMainPos] = useState<Position>(player?.main_pos ?? "CM");
  const [subPos, setSubPos] = useState<Position | "">(player?.sub_pos ?? "");
  const [skill, setSkill] = useState<SkillLevel>(player?.skill_level ?? "Medium");
  const [isMercenary, setIsMercenary] = useState(player?.is_mercenary ?? false);

  useEffect(() => {
    if (open) {
      setName(player?.name ?? "");
      setNumber(player?.number?.toString() ?? "");
      setMainPos(player?.main_pos ?? "CM");
      setSubPos(player?.sub_pos ?? "");
      setSkill(player?.skill_level ?? "Medium");
      setIsMercenary(player?.is_mercenary ?? false);
    }
  }, [open, player]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle>
            {player?.id ? "선수 수정" : isMercenary ? "용병 추가" : "선수 추가"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-muted-foreground mb-1.5 block text-xs">이름</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="bg-secondary border-border"
              />
            </div>
            <div className="w-20">
              <Label className="text-muted-foreground mb-1.5 block text-xs">등번호</Label>
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="#"
                type="number"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-muted-foreground mb-1.5 block text-xs">주 포지션</Label>
              <Select value={mainPos} onValueChange={(v) => setMainPos(v as Position)}>
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
              <Label className="text-muted-foreground mb-1.5 block text-xs">부 포지션</Label>
              <Select value={subPos || "none"} onValueChange={(v) => setSubPos(v === "none" ? "" : v as Position)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="없음" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">없음</SelectItem>
                  {ALL_POSITIONS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground mb-1.5 block text-xs">실력 등급</Label>
            <div className="flex gap-2">
              {(["High", "Medium", "Low"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSkill(level)}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${skill === level
                    ? level === "High"
                      ? "border-skill-high bg-skill-high/15 text-skill-high"
                      : level === "Medium"
                        ? "border-skill-medium bg-skill-medium/15 text-skill-medium"
                        : "border-skill-low bg-skill-low/15 text-skill-low"
                    : "border-border bg-secondary text-muted-foreground"
                    }`}
                >
                  {level === "High" ? "상" : level === "Medium" ? "중" : "하"}
                </button>
              ))}
            </div>
          </div>

          {!player?.id && (
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isMercenary}
                onChange={(e) => setIsMercenary(e.target.checked)}
                className="accent-primary size-4 rounded"
              />
              <span className="text-sm text-foreground">용병</span>
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            onClick={() => {
              if (!name.trim()) return;
              onSave({
                name: name.trim(),
                number: number ? parseInt(number) : undefined,
                main_pos: mainPos,
                sub_pos: subPos,
                skill_level: skill,
                is_mercenary: isMercenary,
              });
              onOpenChange(false);
            }}
            className="bg-primary text-primary-foreground"
          >
            {player?.id ? "저장" : "추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RosterManager() {
  const { state, dispatch } = useLineup();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingPlayer, setEditingPlayer] = useState<Partial<Player> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const players: Player[] = [];

        results.data.forEach((row: any) => {
          // If "이름" is not present, skip
          if (!row["이름"]) return;

          const name = row["이름"].trim();

          // ID logic: Use "학번(10자리)" if it's 10 digits, otherwise generate a random ID
          let id = row["학번(10자리)"]?.trim();
          if (!id || id.length !== 10) {
            id = generateId();
          }

          // Number parsing ("No. 17" -> 17)
          let number: number | undefined;
          if (row["등번호"]) {
            const numMatch = row["등번호"].match(/\d+/);
            if (numMatch) {
              number = parseInt(numMatch[0]);
            }
          }

          // Position parsing (e.g. "LB, RB" -> main: LB, sub: RB)
          let main_pos: Position = "CM";
          let sub_pos: Position | "" = "";
          if (row["주포지션 세부"]) {
            const posSplits = row["주포지션 세부"].split(",").map((p: string) => p.trim());
            if (posSplits.length > 0 && posSplits[0]) {
              main_pos = posSplits[0] as Position;
            }
            if (posSplits.length > 1 && posSplits[1]) {
              sub_pos = posSplits[1] as Position;
            }
          }

          // Skill level -> defaults to Medium in this parser context as PRD didn't specify mapping from CSV initially, 
          // or we can map depending on another column. Right now we use Medium as default.
          const skill_level: SkillLevel = "Medium";

          players.push({
            id,
            name,
            number,
            main_pos,
            sub_pos,
            skill_level,
            is_mercenary: false,
            is_attending: false,
            available_quarters: [false, false, false, false],
          });
        });

        dispatch({ type: "SET_PLAYERS", players });
      },
    });

    e.target.value = "";
  }

  function handleSavePlayer(data: Partial<Player>) {
    if (editingPlayer?.id) {
      dispatch({ type: "UPDATE_PLAYER", id: editingPlayer.id, updates: data });
    } else {
      dispatch({
        type: "ADD_PLAYER",
        player: {
          id: generateId(),
          name: data.name!,
          number: data.number,
          main_pos: data.main_pos || "CM",
          sub_pos: data.sub_pos || "",
          skill_level: data.skill_level || "Medium",
          is_mercenary: data.is_mercenary || false,
          is_attending: false,
          available_quarters: [false, false, false, false],
        },
      });
    }
  }

  const totalPlayers = state.players.length;
  const mercenaries = state.players.filter((p) => p.is_mercenary).length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">선수단 관리</h2>
          <p className="text-xs text-muted-foreground">
            {totalPlayers}명 등록{mercenaries > 0 ? ` (용병 ${mercenaries}명)` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5"
          >
            <Upload className="size-3.5" />
            CSV
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingPlayer(null);
              setDialogOpen(true);
            }}
            className="gap-1.5 bg-primary text-primary-foreground"
          >
            <Plus className="size-3.5" />
            추가
          </Button>
        </div>
      </div>

      {/* Player List */}
      <div className="flex-1 overflow-y-auto px-4">
        {state.players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
              <UserPlus className="size-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              선수를 등록해주세요
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              CSV 파일을 업로드하거나 직접 추가할 수 있습니다
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-1.5"
              onClick={() => {
                // Add sample data
                const samplePlayers: Player[] = [
                  { id: generateId(), name: "김민수", number: 1, main_pos: "GK", sub_pos: "", skill_level: "High", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "이준호", number: 4, main_pos: "CB", sub_pos: "CDM", skill_level: "High", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "박서준", number: 5, main_pos: "CB", sub_pos: "RB", skill_level: "Medium", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "정우성", number: 3, main_pos: "LB", sub_pos: "", skill_level: "Medium", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "최영준", number: 2, main_pos: "RB", sub_pos: "CB", skill_level: "Medium", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "강태현", number: 6, main_pos: "CDM", sub_pos: "CM", skill_level: "High", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "윤석민", number: 8, main_pos: "CM", sub_pos: "CAM", skill_level: "Medium", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "장현우", number: 10, main_pos: "CAM", sub_pos: "CM", skill_level: "High", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "한상혁", number: 7, main_pos: "LW", sub_pos: "LM", skill_level: "Medium", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "임재영", number: 9, main_pos: "ST", sub_pos: "CF", skill_level: "High", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "송민규", number: 11, main_pos: "RW", sub_pos: "RM", skill_level: "Medium", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "오지훈", number: 14, main_pos: "CM", sub_pos: "CDM", skill_level: "Low", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "신동혁", number: 15, main_pos: "CB", sub_pos: "", skill_level: "Low", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "유승호", number: 16, main_pos: "ST", sub_pos: "LW", skill_level: "Medium", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                  { id: generateId(), name: "권혁진", number: 17, main_pos: "RM", sub_pos: "", skill_level: "Low", is_mercenary: false, is_attending: false, available_quarters: [false, false, false, false] },
                ];
                dispatch({ type: "SET_PLAYERS", players: samplePlayers });
              }}
            >
              샘플 데이터 불러오기
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-4">
            {state.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary font-mono text-sm font-bold text-foreground">
                  {player.number ?? "-"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {player.name}
                    </span>
                    {player.is_mercenary && (
                      <Badge variant="outline" className="border-chart-5/30 bg-chart-5/15 text-chart-5 text-[10px]">
                        용병
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{player.main_pos}</span>
                    {player.sub_pos && (
                      <>
                        <span className="text-border">/</span>
                        <span>{player.sub_pos}</span>
                      </>
                    )}
                  </div>
                </div>
                <SkillBadge level={player.skill_level} />
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingPlayer(player);
                      setDialogOpen(true);
                    }}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label={`${player.name} 수정`}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: "REMOVE_PLAYER", id: player.id })}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`${player.name} 삭제`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Step */}
      {state.players.length > 0 && (
        <div className="border-t border-border p-4">
          <Button
            className="w-full bg-primary text-primary-foreground"
            onClick={() => dispatch({ type: "SET_STEP", step: 1 })}
          >
            참석자 선택하기
          </Button>
        </div>
      )}

      <PlayerEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        player={editingPlayer}
        onSave={handleSavePlayer}
      />
    </div>
  );
}
