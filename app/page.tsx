"use client";

import { LineupProvider, useLineup } from "@/lib/lineup-context";
import { StepNavigator } from "@/components/step-navigator";
import { RosterManager } from "@/components/roster-manager";
import { AttendanceManager } from "@/components/attendance-manager";
import { FormationSelector } from "@/components/formation-selector";
import { LineupView } from "@/components/lineup-view";
import { ShareView } from "@/components/share-view";

import { useState, useEffect } from "react";

function AppContent() {
  const { state } = useLineup();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* App Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <svg
              viewBox="0 0 24 24"
              className="size-5 text-primary-foreground"
              fill="currentColor"
            >
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2 L14 8 L20 8 L15 12 L17 18 L12 14 L7 18 L9 12 L4 8 L10 8 Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-foreground">
              LINEUP MAKER
            </h1>
            <p className="text-[10px] text-muted-foreground">
              축구 동아리 라인업 자동 생성
            </p>
          </div>
        </div>
      </header>

      {/* Step Navigator */}
      <StepNavigator />

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        {state.currentStep === 0 && <RosterManager />}
        {state.currentStep === 1 && <AttendanceManager />}
        {state.currentStep === 2 && (
          state.quarterLineups.length > 0 ? <LineupView /> : <FormationSelector />
        )}
        {state.currentStep === 3 && <ShareView />}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <LineupProvider>
      <AppContent />
    </LineupProvider>
  );
}
