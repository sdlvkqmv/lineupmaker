"use client";

import { useRef, useCallback, useState } from "react";
import { useLineup } from "@/lib/lineup-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Copy,
  Share,
  Download,
  Check,
} from "lucide-react";

const QUARTER_LABELS = ["1Q", "2Q", "3Q", "4Q"];

export function ShareView() {
  const { state, dispatch } = useLineup();
  const textRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  function getPlayerById(id: string) {
    return state.players.find((p) => p.id === id);
  }

  const generateText = useCallback(() => {
    let text = `[${state.formation} 라인업]\n\n`;

    state.quarterLineups.forEach((ql, qi) => {
      text += `--- ${QUARTER_LABELS[qi]} ---\n`;
      ql.starters.forEach((s) => {
        const player = getPlayerById(s.playerId);
        if (player) {
          text += `${s.position.role}: ${player.name}${
            player.number ? ` (#${player.number})` : ""
          }\n`;
        }
      });
      if (ql.subs.length > 0) {
        text += `SUB: ${ql.subs
          .map((id) => getPlayerById(id)?.name)
          .filter(Boolean)
          .join(", ")}\n`;
      }
      text += "\n";
    });

    return text;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.quarterLineups, state.formation, state.players]);

  async function handleCopy() {
    const text = generateText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleShare() {
    const text = generateText();
    if (navigator.share) {
      try {
        await navigator.share({ title: `${state.formation} 라인업`, text });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  }

  async function handleDownloadImage() {
    if (!textRef.current) return;
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 40;
    const lineHeight = 28;
    const text = generateText();
    const lines = text.split("\n");
    
    canvas.width = 600;
    canvas.height = padding * 2 + lines.length * lineHeight + 40;

    // Background
    ctx.fillStyle = "#1a2e1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title bar
    ctx.fillStyle = "#243d24";
    ctx.fillRect(0, 0, canvas.width, 60);
    ctx.fillStyle = "#5ac05a";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(`LINEUP MAKER`, padding, 38);

    // Text content
    ctx.font = "15px sans-serif";
    let y = 80 + padding;
    lines.forEach((line) => {
      if (line.startsWith("---")) {
        ctx.fillStyle = "#5ac05a";
        ctx.font = "bold 16px sans-serif";
      } else if (line.startsWith("SUB:")) {
        ctx.fillStyle = "#8a8a70";
        ctx.font = "14px sans-serif";
      } else if (line.startsWith("[")) {
        ctx.fillStyle = "#e8e8d0";
        ctx.font = "bold 18px sans-serif";
      } else {
        ctx.fillStyle = "#c8c8b0";
        ctx.font = "15px sans-serif";
      }
      ctx.fillText(line, padding, y);
      y += lineHeight;
    });

    const link = document.createElement("a");
    link.download = `lineup-${state.formation}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          onClick={() => dispatch({ type: "SET_STEP", step: 2 })}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="이전으로"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">라인업 공유</h2>
          <p className="text-xs text-muted-foreground">{state.formation}</p>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto px-4">
        <div
          ref={textRef}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary" />
            <span className="text-sm font-bold text-foreground">
              {state.formation} 라인업
            </span>
          </div>

          {state.quarterLineups.map((ql, qi) => (
            <div key={qi} className="mb-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-primary/15 text-primary border-0 text-xs font-bold">
                  {QUARTER_LABELS[qi]}
                </Badge>
              </div>
              <div className="flex flex-col gap-1 pl-1">
                {ql.starters.map((s, si) => {
                  const player = getPlayerById(s.playerId);
                  if (!player) return null;
                  return (
                    <div key={si} className="flex items-center gap-2 text-xs">
                      <span className="w-8 font-mono font-bold text-muted-foreground">
                        {s.position.role}
                      </span>
                      <span className="text-foreground">{player.name}</span>
                      {player.number !== undefined && (
                        <span className="text-muted-foreground">
                          #{player.number}
                        </span>
                      )}
                    </div>
                  );
                })}
                {ql.subs.length > 0 && (
                  <div className="mt-1 flex items-start gap-2 text-xs">
                    <span className="w-8 font-mono font-bold text-muted-foreground">
                      SUB
                    </span>
                    <span className="text-muted-foreground">
                      {ql.subs
                        .map((id) => getPlayerById(id)?.name)
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Actions */}
      <div className="flex flex-col gap-2 border-t border-border p-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="size-4 text-primary" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="size-4" />
                텍스트 복사
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleDownloadImage}
          >
            <Download className="size-4" />
            이미지 저장
          </Button>
        </div>
        <Button
          className="w-full gap-2 bg-primary text-primary-foreground"
          onClick={handleShare}
        >
          <Share className="size-4" />
          공유하기
        </Button>
      </div>
    </div>
  );
}
