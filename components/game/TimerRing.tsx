"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TimerRingProps {
  phaseEndsAt: string | null;
  active: boolean;
}

export function TimerRing({ phaseEndsAt, active }: TimerRingProps) {
  const [remaining, setRemaining] = useState(5.5);
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    if (!active || !phaseEndsAt) {
      setRemaining(5.5);
      setUrgent(false);
      return;
    }

    const tick = () => {
      const ms = new Date(phaseEndsAt).getTime() - Date.now();
      const secs = Math.max(0, ms / 1000);
      setRemaining(secs);
      setUrgent(secs <= 2 && secs > 0);
      if (secs <= 0) {
        const audio = document.getElementById("zoop-sound") as HTMLAudioElement;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      }
    };

    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [phaseEndsAt, active]);

  const display = remaining.toFixed(1);
  const progress = active ? (remaining / 5.5) * 100 : 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "relative flex h-28 w-28 md:h-32 md:w-32 items-center justify-center rounded-full border-4",
          urgent ? "border-brick" : "border-graphite",
          active && remaining <= 0 && "border-brick",
        )}
        style={{
          background: `conic-gradient(#E3E0DA ${progress}%, #303030 ${progress}%)`,
        }}
      >
        <div className="flex h-[calc(100%-12px)] w-[calc(100%-12px)] items-center justify-center rounded-full bg-ink">
          <span
            className={cn(
              "font-mono text-3xl md:text-4xl font-bold tabular-nums",
              urgent ? "text-brick" : "text-paper",
            )}
          >
            {active ? display : "—"}
          </span>
        </div>
      </div>
      <span className="text-xs font-mono uppercase tracking-widest text-ash">
        {active ? "seconds left" : "timer idle"}
      </span>
      <audio id="zoop-sound" preload="auto">
        <source src="/sounds/zoop.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}
