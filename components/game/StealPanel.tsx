"use client";

import { Panel, Label } from "@/components/ui/Panel";

interface StealPanelProps {
  usedAnswers: string[];
}

export function StealPanel({ usedAnswers }: StealPanelProps) {
  if (usedAnswers.length === 0) return null;

  return (
    <Panel>
      <Label>Used answers this round</Label>
      <ul className="mt-2 list-disc pl-5 text-ash text-sm">
        {usedAnswers.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-ash">
        Steal attempts cannot reuse these answers.
      </p>
    </Panel>
  );
}
