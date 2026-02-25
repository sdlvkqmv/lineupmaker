"use client";

import { useLineup } from "@/lib/lineup-context";
import {
  Users,
  CheckSquare,
  LayoutGrid,
  Share2,
} from "lucide-react";

const steps = [
  { icon: Users, label: "선수단" },
  { icon: CheckSquare, label: "참석" },
  { icon: LayoutGrid, label: "라인업" },
  { icon: Share2, label: "공유" },
];

export function StepNavigator() {
  const { state, dispatch } = useLineup();

  return (
    <nav className="flex items-center justify-between border-b border-border bg-card px-2 py-2">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = state.currentStep === i;
        const isPast = state.currentStep > i;

        return (
          <button
            key={i}
            onClick={() => dispatch({ type: "SET_STEP", step: i })}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors ${
              isActive
                ? "text-primary"
                : isPast
                ? "text-muted-foreground"
                : "text-muted-foreground/50"
            }`}
            aria-label={`Step ${i + 1}: ${step.label}`}
            aria-current={isActive ? "step" : undefined}
          >
            <div
              className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : isPast
                  ? "bg-secondary text-muted-foreground"
                  : "text-muted-foreground/40"
              }`}
            >
              <Icon className="size-4" />
            </div>
            <span>{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
